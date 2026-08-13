import logging
from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.config import settings
from app.db import execute, fetch_one, get_connection
from app.deps import Principal, get_principal, require_owner
from app.schemas import CheckoutRequest
from app.services import stripe_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/billing", tags=["billing"])


@router.get("/usage")
async def get_usage(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    organization = await fetch_one(
        conn,
        "select id, name, plan, billing_anchor, created_at from organizations where id = :org_id",
        {"org_id": principal.org_id},
    )

    subscription = await fetch_one(
        conn,
        """
        select id, org_id, stripe_customer_id, stripe_subscription_id, plan, status,
               cancel_at_period_end, current_period_end
        from subscriptions where org_id = :org_id
        """,
        {"org_id": principal.org_id},
    ) or {
        "id": None,
        "org_id": principal.org_id,
        "stripe_customer_id": None,
        "stripe_subscription_id": None,
        "plan": None,
        "status": "trialing",
        "cancel_at_period_end": False,
        "current_period_end": None,
    }

    usage = await fetch_one(
        conn,
        """
        select org_id, period_start, period_end, prospects_used, posts_used, senders_used
        from usage_counters
        where org_id = :org_id and now() between period_start and period_end
        order by period_start desc limit 1
        """,
        {"org_id": principal.org_id},
    )

    if not usage:
        # Anchor the cycle on the org's own billing date, never the 1st.
        usage = await fetch_one(
            conn,
            """
            insert into usage_counters (org_id, period_start, period_end, prospects_used, posts_used, senders_used)
            select :org_id, now(), now() + interval '30 days', 0, 0,
                   (select count(*) from connected_accounts
                     where org_id = :org_id and status <> 'disconnected')
            returning org_id, period_start, period_end, prospects_used, posts_used, senders_used
            """,
            {"org_id": principal.org_id},
        )

    return {"organization": organization, "subscription": subscription, "usage": usage}


@router.get("/invoices")
async def list_invoices(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    subscription = await fetch_one(
        conn,
        "select stripe_customer_id from subscriptions where org_id = :org_id",
        {"org_id": principal.org_id},
    )
    customer_id = (subscription or {}).get("stripe_customer_id")

    if not customer_id or not settings.has_stripe:
        return []

    try:
        return stripe_service.list_invoices(customer_id)
    except stripe.StripeError:
        logger.exception("Could not list invoices")
        return []


@router.post("/checkout")
async def checkout(
    body: CheckoutRequest,
    principal: Principal = Depends(require_owner),
    conn: AsyncConnection = Depends(get_connection),
):
    """Returns `{url}` for the browser to follow, or updates the plan directly in test mode."""
    if body.plan == "custom":
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Custom plans are arranged with the sales team.")

    subscription = await fetch_one(
        conn,
        "select stripe_customer_id from subscriptions where org_id = :org_id",
        {"org_id": principal.org_id},
    )

    try:
        url = stripe_service.create_checkout_session(
            plan=body.plan,
            org_id=principal.org_id,
            customer_email=principal.email,
            customer_id=(subscription or {}).get("stripe_customer_id"),
        )
        return {"url": url}
    except stripe_service.StripeUnavailable:
        # TODO: requires STRIPE_SECRET_KEY + price IDs. Without them we still let
        # the workspace change plan so the product is fully exercisable.
        logger.info("Stripe not configured — applying the plan change directly")
        await _apply_plan(conn, principal.org_id, body.plan)
        return {"url": None, "plan": body.plan, "stripe": False}
    except stripe.StripeError as exc:
        logger.exception("Checkout session failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not start checkout.") from exc


@router.post("/portal")
async def portal(
    principal: Principal = Depends(require_owner),
    conn: AsyncConnection = Depends(get_connection),
):
    subscription = await fetch_one(
        conn,
        "select stripe_customer_id from subscriptions where org_id = :org_id",
        {"org_id": principal.org_id},
    )
    customer_id = (subscription or {}).get("stripe_customer_id")

    if not customer_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No billing account yet.")

    try:
        return {"url": stripe_service.create_portal_session(customer_id)}
    except stripe_service.StripeUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc


@router.post("/cancel")
async def cancel(
    principal: Principal = Depends(require_owner),
    conn: AsyncConnection = Depends(get_connection),
):
    """Two clicks in the UI, one call here, no retention flow. Cancels at period end."""
    subscription = await fetch_one(
        conn,
        "select stripe_subscription_id from subscriptions where org_id = :org_id",
        {"org_id": principal.org_id},
    )
    stripe_subscription_id = (subscription or {}).get("stripe_subscription_id")

    if stripe_subscription_id and settings.has_stripe:
        try:
            stripe_service.cancel_at_period_end(stripe_subscription_id)
        except stripe.StripeError as exc:
            logger.exception("Stripe cancellation failed")
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not cancel with Stripe.") from exc

    await execute(
        conn,
        "update subscriptions set cancel_at_period_end = true where org_id = :org_id",
        {"org_id": principal.org_id},
    )
    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, action, detail, actor)
        values (:org_id, 'billing', 'subscription_cancelled', 'Subscription set to cancel at period end', 'human')
        """,
        {"org_id": principal.org_id},
    )

    return {"ok": True, "cancel_at_period_end": True}


@router.post("/resume")
async def resume(
    principal: Principal = Depends(require_owner),
    conn: AsyncConnection = Depends(get_connection),
):
    subscription = await fetch_one(
        conn,
        "select stripe_subscription_id from subscriptions where org_id = :org_id",
        {"org_id": principal.org_id},
    )
    stripe_subscription_id = (subscription or {}).get("stripe_subscription_id")

    if stripe_subscription_id and settings.has_stripe:
        try:
            stripe_service.resume(stripe_subscription_id)
        except stripe.StripeError as exc:
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not resume with Stripe.") from exc

    await execute(
        conn,
        "update subscriptions set cancel_at_period_end = false where org_id = :org_id",
        {"org_id": principal.org_id},
    )
    return {"ok": True, "cancel_at_period_end": False}


@router.post("/webhook", include_in_schema=False)
async def webhook(request: Request, conn: AsyncConnection = Depends(get_connection)):
    """
    Stripe webhook. Signature verification is mandatory — the payload is
    untrusted input until `construct_event` succeeds.
    """
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")

    try:
        event = stripe_service.verify_webhook(payload, signature)
    except stripe_service.StripeUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except (stripe.SignatureVerificationError, ValueError) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid signature") from exc

    data = event["data"]["object"]
    event_type = event["type"]

    if event_type == "checkout.session.completed":
        org_id = (data.get("metadata") or {}).get("org_id") or data.get("client_reference_id")
        plan = (data.get("metadata") or {}).get("plan", "pro")
        if org_id:
            await execute(
                conn,
                """
                insert into subscriptions (org_id, stripe_customer_id, stripe_subscription_id, plan, status)
                values (:org_id, :customer, :subscription, :plan, 'active')
                on conflict (org_id) do update
                  set stripe_customer_id = excluded.stripe_customer_id,
                      stripe_subscription_id = excluded.stripe_subscription_id,
                      plan = excluded.plan,
                      status = excluded.status
                """,
                {
                    "org_id": org_id,
                    "customer": data.get("customer"),
                    "subscription": data.get("subscription"),
                    "plan": plan,
                },
            )
            await _apply_plan(conn, org_id, plan)

    elif event_type in {"customer.subscription.updated", "customer.subscription.created"}:
        org_id = (data.get("metadata") or {}).get("org_id")
        period_end = data.get("current_period_end")
        if org_id:
            await execute(
                conn,
                """
                update subscriptions
                   set status = :status,
                       cancel_at_period_end = :cancel,
                       current_period_end = :period_end
                 where org_id = :org_id
                """,
                {
                    "org_id": org_id,
                    "status": data.get("status"),
                    "cancel": bool(data.get("cancel_at_period_end")),
                    "period_end": datetime.fromtimestamp(period_end, tz=timezone.utc) if period_end else None,
                },
            )

    elif event_type == "customer.subscription.deleted":
        org_id = (data.get("metadata") or {}).get("org_id")
        if org_id:
            await execute(
                conn,
                "update subscriptions set status = 'canceled' where org_id = :org_id",
                {"org_id": org_id},
            )
            await execute(
                conn,
                "update organizations set plan = 'trial' where id = :org_id",
                {"org_id": org_id},
            )

    else:
        logger.info("Unhandled Stripe event: %s", event_type)

    return {"received": True}


async def _apply_plan(conn: AsyncConnection, org_id: str, plan: str) -> None:
    await execute(
        conn,
        "update organizations set plan = :plan where id = :org_id",
        {"org_id": org_id, "plan": plan},
    )
    await execute(
        conn,
        """
        insert into subscriptions (org_id, plan, status)
        values (:org_id, :plan, 'active')
        on conflict (org_id) do update set plan = excluded.plan, status = 'active', cancel_at_period_end = false
        """,
        {"org_id": org_id, "plan": plan},
    )
