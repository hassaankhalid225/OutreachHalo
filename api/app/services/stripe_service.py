"""Stripe Checkout, Customer Portal and webhook handling (test mode by default)."""

from __future__ import annotations

import logging

import stripe

from app.config import settings

logger = logging.getLogger(__name__)

PRICE_IDS = {
    "pro": lambda: settings.stripe_price_pro,
    "growth": lambda: settings.stripe_price_growth,
}


class StripeUnavailable(RuntimeError):
    """Raised when Stripe is not configured, so callers can fall back."""


def _client() -> None:
    if not settings.has_stripe:
        raise StripeUnavailable("STRIPE_SECRET_KEY is not configured")
    stripe.api_key = settings.stripe_secret_key


def create_checkout_session(plan: str, org_id: str, customer_email: str | None, customer_id: str | None) -> str:
    """Returns a Checkout URL for the browser to follow."""
    _client()

    price_lookup = PRICE_IDS.get(plan)
    if not price_lookup or not price_lookup():
        raise StripeUnavailable(f"No Stripe price configured for the {plan} plan")

    session = stripe.checkout.Session.create(
        mode="subscription",
        line_items=[{"price": price_lookup(), "quantity": 1}],
        success_url=f"{settings.app_url}/app/billing?checkout=success",
        cancel_url=f"{settings.app_url}/app/billing?checkout=cancelled",
        client_reference_id=org_id,
        customer=customer_id or None,
        customer_email=None if customer_id else customer_email,
        subscription_data={
            "trial_period_days": 7,
            "metadata": {"org_id": org_id, "plan": plan},
        },
        metadata={"org_id": org_id, "plan": plan},
        allow_promotion_codes=True,
    )

    return session.url


def create_portal_session(customer_id: str) -> str:
    _client()
    session = stripe.billing_portal.Session.create(
        customer=customer_id,
        return_url=f"{settings.app_url}/app/billing",
    )
    return session.url


def cancel_at_period_end(subscription_id: str) -> None:
    _client()
    stripe.Subscription.modify(subscription_id, cancel_at_period_end=True)


def resume(subscription_id: str) -> None:
    _client()
    stripe.Subscription.modify(subscription_id, cancel_at_period_end=False)


def list_invoices(customer_id: str, limit: int = 12) -> list[dict]:
    _client()
    invoices = stripe.Invoice.list(customer=customer_id, limit=limit)
    return [
        {
            "id": invoice.id,
            "date": invoice.created,
            "amount": invoice.amount_paid,
            "status": invoice.status,
            "plan": (invoice.lines.data[0].description if invoice.lines.data else "Subscription"),
            "pdf": invoice.invoice_pdf,
        }
        for invoice in invoices.auto_paging_iter()
    ]


def verify_webhook(payload: bytes, signature: str) -> stripe.Event:
    """Signature verification is mandatory — an unverified webhook is untrusted input."""
    _client()
    if not settings.stripe_webhook_secret:
        raise StripeUnavailable("STRIPE_WEBHOOK_SECRET is not configured")

    return stripe.Webhook.construct_event(payload, signature, settings.stripe_webhook_secret)
