"""Agents, connected accounts, settings, team and dashboard aggregates."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.db import execute, fetch_all, fetch_one, get_connection
from app.deps import Principal, get_principal, require_owner
from app.schemas import AccountPatch, AgentCreate, AgentPatch, ConnectAccountRequest, InviteRequest, SettingsPatch

router = APIRouter(tags=["workspace"])


# ============================================================= Dashboard


@router.get("/dashboard/stats")
async def dashboard_stats(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    row = await fetch_one(
        conn,
        """
        select
          (select count(*) from prospects
            where org_id = :org_id and created_at >= date_trunc('month', now())) as prospects_this_month,
          (select count(*) from messages where org_id = :org_id and direction = 'outbound') as messages_sent,
          (select count(distinct prospect_id) from messages
            where org_id = :org_id and direction = 'outbound') as contacted,
          (select count(distinct prospect_id) from messages
            where org_id = :org_id and direction = 'inbound') as replied,
          (select count(*) from conversations
            where org_id = :org_id and meeting_booked_at is not null) as meetings_booked,
          (select count(*) from messages
            where org_id = :org_id and direction = 'inbound' and read_at is null) as unread_replies,
          (select count(*) from prospects where org_id = :org_id) as total_prospects,
          (select count(*) from prospects where org_id = :org_id and intent_level = 'hot') as hot_prospects
        """,
        {"org_id": principal.org_id},
    )

    contacted = int(row["contacted"] or 0)
    replied = int(row["replied"] or 0)

    return {
        "prospects_this_month": int(row["prospects_this_month"] or 0),
        "messages_sent": int(row["messages_sent"] or 0),
        "reply_rate": round(replied / contacted * 100, 1) if contacted else 0.0,
        "meetings_booked": int(row["meetings_booked"] or 0),
        "unread_replies": int(row["unread_replies"] or 0),
        "total_prospects": int(row["total_prospects"] or 0),
        "hot_prospects": int(row["hot_prospects"] or 0),
    }


@router.get("/dashboard/activity")
async def dashboard_activity(
    days: int = Query(14, ge=1, le=90),
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    """One row per day including days with no activity, so the chart has no gaps."""
    return await fetch_all(
        conn,
        """
        select to_char(d.day, 'YYYY-MM-DD') as date,
               coalesce(sum(case when m.direction = 'outbound' then 1 else 0 end), 0)::int as sent,
               coalesce(sum(case when m.direction = 'inbound' then 1 else 0 end), 0)::int as replies
        from generate_series(
               date_trunc('day', now()) - make_interval(days => :days - 1),
               date_trunc('day', now()),
               interval '1 day') as d(day)
        left join messages m
               on m.org_id = :org_id
              and m.sent_at >= d.day
              and m.sent_at < d.day + interval '1 day'
        group by d.day
        order by d.day
        """,
        {"org_id": principal.org_id, "days": days},
    )


@router.get("/dashboard/feed")
async def dashboard_feed(
    limit: int = Query(6, ge=1, le=50),
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    return await fetch_all(
        conn,
        """
        select id, org_id, entity_type, action, detail, actor, created_at
        from automation_log where org_id = :org_id
        order by created_at desc limit :limit
        """,
        {"org_id": principal.org_id, "limit": limit},
    )


# ================================================================ Agents

AGENT_COLUMNS = "id, org_id, name, status, channels, approval_mode, tone, daily_cap, created_at"


@router.get("/agents")
async def list_agents(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    return await fetch_all(
        conn,
        f"select {AGENT_COLUMNS} from agents where org_id = :org_id order by created_at asc",
        {"org_id": principal.org_id},
    )


@router.post("/agents", status_code=status.HTTP_201_CREATED)
async def create_agent(
    body: AgentCreate,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    # Plan limits are enforced here, not just in the UI.
    plan_row = await fetch_one(
        conn, "select plan from organizations where id = :org_id", {"org_id": principal.org_id}
    )
    limits = {"trial": 2, "pro": 2, "growth": 4}
    cap = limits.get((plan_row or {}).get("plan", "trial"))

    if cap is not None:
        count_row = await fetch_one(
            conn, "select count(*) as count from agents where org_id = :org_id", {"org_id": principal.org_id}
        )
        if int(count_row["count"]) >= cap:
            raise HTTPException(
                status.HTTP_402_PAYMENT_REQUIRED,
                f"Your plan includes {cap} agents. Upgrade to add more.",
            )

    return await fetch_one(
        conn,
        f"""
        insert into agents (org_id, name, status, channels, approval_mode)
        values (:org_id, :name, 'active', array['linkedin','email'], 'approve_first')
        returning {AGENT_COLUMNS}
        """,
        {"org_id": principal.org_id, "name": body.name},
    )


@router.patch("/agents/{agent_id}")
async def update_agent(
    agent_id: str,
    body: AgentPatch,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    patch = body.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nothing to update")

    assignments = ", ".join(f"{column} = :{column}" for column in patch)
    row = await fetch_one(
        conn,
        f"update agents set {assignments} where id = :id and org_id = :org_id returning {AGENT_COLUMNS}",
        {**patch, "id": agent_id, "org_id": principal.org_id},
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Agent not found")
    return row


# ============================================================== Accounts

ACCOUNT_COLUMNS = """
    id, org_id, provider, account_label, status, daily_cap, last_synced_at, connected_at
"""


@router.get("/accounts")
async def list_accounts(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    return await fetch_all(
        conn,
        f"select {ACCOUNT_COLUMNS} from connected_accounts where org_id = :org_id order by provider",
        {"org_id": principal.org_id},
    )


@router.post("/accounts/connect")
async def connect_account(
    body: ConnectAccountRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    # TODO: requires real OAuth (Phase 2). Until then the row is created in
    # `mock_connected` so the rest of the product is fully configurable.
    row = await fetch_one(
        conn,
        f"""
        insert into connected_accounts (org_id, provider, status, connected_at, last_synced_at)
        values (:org_id, :provider, 'mock_connected', now(), now())
        on conflict (org_id, provider) do update
          set status = 'mock_connected', connected_at = now(), last_synced_at = now()
        returning {ACCOUNT_COLUMNS}
        """,
        {"org_id": principal.org_id, "provider": body.provider},
    )

    await _sync_sender_usage(conn, principal.org_id)
    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
        values (:org_id, 'account', :id, 'account_connected', :detail, 'human')
        """,
        {"org_id": principal.org_id, "id": row["id"], "detail": f"Connected {body.provider.replace('_', ' ')}"},
    )

    return row


@router.post("/accounts/{account_id}/disconnect")
async def disconnect_account(
    account_id: str,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    """One click. Sending stops immediately — that is the promise on the site."""
    row = await fetch_one(
        conn,
        f"""
        update connected_accounts
           set status = 'disconnected', connected_at = null, oauth_meta = '{{}}'::jsonb
         where id = :id and org_id = :org_id
        returning {ACCOUNT_COLUMNS}
        """,
        {"id": account_id, "org_id": principal.org_id},
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Account not found")

    await _sync_sender_usage(conn, principal.org_id)
    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
        values (:org_id, 'account', :id, 'account_disconnected', :detail, 'human')
        """,
        {"org_id": principal.org_id, "id": account_id, "detail": f"Disconnected {row['provider'].replace('_', ' ')}"},
    )

    return row


@router.patch("/accounts/{account_id}")
async def patch_account(
    account_id: str,
    body: AccountPatch,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    patch = body.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nothing to update")

    assignments = ", ".join(f"{column} = :{column}" for column in patch)
    row = await fetch_one(
        conn,
        f"update connected_accounts set {assignments} where id = :id and org_id = :org_id returning {ACCOUNT_COLUMNS}",
        {**patch, "id": account_id, "org_id": principal.org_id},
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Account not found")
    return row


async def _sync_sender_usage(conn: AsyncConnection, org_id: str) -> None:
    await execute(
        conn,
        """
        update usage_counters
           set senders_used = (select count(*) from connected_accounts
                                where org_id = :org_id and status <> 'disconnected')
         where org_id = :org_id and now() between period_start and period_end
        """,
        {"org_id": org_id},
    )


# ============================================================== Settings


@router.get("/settings")
async def get_settings(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    row = await fetch_one(
        conn,
        """
        select org_id, booking_url, timezone, sending_hours_start, sending_hours_end,
               notify_hot_reply, notify_daily_digest, notify_product_updates
        from org_settings where org_id = :org_id
        """,
        {"org_id": principal.org_id},
    )

    if row:
        return row

    return await fetch_one(
        conn,
        """
        insert into org_settings (org_id) values (:org_id)
        returning org_id, booking_url, timezone, sending_hours_start, sending_hours_end,
                  notify_hot_reply, notify_daily_digest, notify_product_updates
        """,
        {"org_id": principal.org_id},
    )


@router.patch("/settings")
async def patch_settings(
    body: SettingsPatch,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    patch = body.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nothing to update")

    await get_settings(principal, conn)  # ensure the row exists

    assignments = ", ".join(f"{column} = :{column}" for column in patch)
    return await fetch_one(
        conn,
        f"""
        update org_settings set {assignments}, updated_at = now()
         where org_id = :org_id
        returning org_id, booking_url, timezone, sending_hours_start, sending_hours_end,
                  notify_hot_reply, notify_daily_digest, notify_product_updates
        """,
        {**patch, "org_id": principal.org_id},
    )


# ================================================================== Team


@router.get("/team")
async def list_team(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    members = await fetch_all(
        conn,
        """
        select id, full_name, email, role, 'active' as status, created_at
        from profiles where org_id = :org_id
        order by created_at asc
        """,
        {"org_id": principal.org_id},
    )
    invites = await fetch_all(
        conn,
        """
        select id, null as full_name, email, role, 'pending' as status, created_at
        from pending_invites where org_id = :org_id and status = 'pending'
        order by created_at asc
        """,
        {"org_id": principal.org_id},
    )
    return members + invites


@router.post("/team/invite", status_code=status.HTTP_201_CREATED)
async def invite_member(
    body: InviteRequest,
    principal: Principal = Depends(require_owner),
    conn: AsyncConnection = Depends(get_connection),
):
    existing = await fetch_one(
        conn,
        "select id from profiles where org_id = :org_id and lower(email) = :email",
        {"org_id": principal.org_id, "email": body.email},
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "That person is already in the workspace.")

    row = await fetch_one(
        conn,
        """
        insert into pending_invites (org_id, email, role, invited_by)
        values (:org_id, :email, :role, :invited_by)
        on conflict (org_id, email) do update set role = :role, status = 'pending'
        returning id, null as full_name, email, role, 'pending' as status, created_at
        """,
        {
            "org_id": principal.org_id,
            "email": body.email,
            "role": body.role,
            "invited_by": principal.user_id,
        },
    )

    # TODO: requires a transactional email provider (or Supabase's invite API)
    # to actually deliver the join link. The invite row is the source of truth.
    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
        values (:org_id, 'team', :id, 'member_invited', :detail, 'human')
        """,
        {"org_id": principal.org_id, "id": row["id"], "detail": f"Invited {body.email} as {body.role}"},
    )

    return row


@router.delete("/team/{invite_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_invite(
    invite_id: str,
    principal: Principal = Depends(require_owner),
    conn: AsyncConnection = Depends(get_connection),
):
    await execute(
        conn,
        "delete from pending_invites where id = :id and org_id = :org_id",
        {"id": invite_id, "org_id": principal.org_id},
    )
