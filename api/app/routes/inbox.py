import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.db import execute, fetch_all, fetch_one, get_connection
from app.deps import Principal, get_principal
from app.rate_limit import rate_limit
from app.schemas import AutopilotRequest, GenerateReplyRequest, GeneratedText, IntentRequest, ReplyRequest
from app.services import ai

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/inbox", tags=["inbox"])

CONVERSATION_SELECT = """
select c.id, c.org_id, c.prospect_id, c.intent_tag, c.autopilot_enabled,
       c.meeting_booked_at, c.last_message_at,
       json_build_object(
         'id', p.id, 'full_name', p.full_name, 'title', p.title, 'company', p.company,
         'avatar_url', p.avatar_url, 'signals', p.signals, 'fit_score', p.fit_score,
         'intent_level', p.intent_level
       ) as prospect,
       coalesce((select m.body from messages m
                  where m.conversation_id = c.id
                  order by m.sent_at desc limit 1), '') as last_message_snippet,
       (select count(*) from messages m
         where m.conversation_id = c.id and m.direction = 'inbound' and m.read_at is null) as unread_count
from conversations c
join prospects p on p.id = c.prospect_id
where c.org_id = :org_id
"""


@router.get("")
async def list_conversations(
    intent: str = Query("all"),
    search: str = Query(""),
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    clauses = []
    params: dict = {"org_id": principal.org_id}

    if intent in {"interested", "question", "not_now", "neutral"}:
        clauses.append("c.intent_tag = :intent")
        params["intent"] = intent

    if search.strip():
        clauses.append("(p.full_name ilike :search or p.company ilike :search)")
        params["search"] = f"%{search.strip()}%"

    extra = (" and " + " and ".join(clauses)) if clauses else ""
    rows = await fetch_all(conn, f"{CONVERSATION_SELECT}{extra} order by c.last_message_at desc", params)

    for row in rows:
        row["unread_count"] = int(row.get("unread_count") or 0)
    return rows


@router.get("/{conversation_id}/messages")
async def get_thread(
    conversation_id: str,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    conversation = await fetch_one(
        conn, f"{CONVERSATION_SELECT} and c.id = :id", {"org_id": principal.org_id, "id": conversation_id}
    )
    if not conversation:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    conversation["unread_count"] = int(conversation.get("unread_count") or 0)

    prospect = await fetch_one(
        conn,
        """
        select id, org_id, full_name, title, company, avatar_url, linkedin_url, location,
               company_size, industry, fit_score, intent_level, signals, source,
               sequence_status, last_activity_at, created_at
        from prospects where id = :prospect_id and org_id = :org_id
        """,
        {"prospect_id": conversation["prospect_id"], "org_id": principal.org_id},
    )

    messages = await fetch_all(
        conn,
        """
        select id, org_id, prospect_id, conversation_id, channel, direction, subject,
               body, sent_at, read_at, ai_generated
        from messages where conversation_id = :id and org_id = :org_id
        order by sent_at asc
        """,
        {"id": conversation_id, "org_id": principal.org_id},
    )

    return {"conversation": conversation, "prospect": prospect, "messages": messages}


@router.post("/{conversation_id}/read")
async def mark_read(
    conversation_id: str,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    await execute(
        conn,
        """
        update messages set read_at = now()
        where conversation_id = :id and org_id = :org_id and direction = 'inbound' and read_at is null
        """,
        {"id": conversation_id, "org_id": principal.org_id},
    )
    return {"ok": True}


@router.post("/{conversation_id}/reply")
async def send_reply(
    conversation_id: str,
    body: ReplyRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    conversation = await fetch_one(
        conn,
        """
        select c.id, c.prospect_id, c.autopilot_enabled, p.full_name
        from conversations c join prospects p on p.id = c.prospect_id
        where c.id = :id and c.org_id = :org_id
        """,
        {"id": conversation_id, "org_id": principal.org_id},
    )
    if not conversation:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")

    # TODO: requires the Phase 2 LinkedIn/Gmail send integrations. Until then the
    # message is recorded exactly as a real send would be, so nothing downstream
    # (threading, reply detection, reporting) needs to change when they land.
    message = await fetch_one(
        conn,
        """
        insert into messages (org_id, prospect_id, conversation_id, channel, direction, body, ai_generated, read_at)
        values (:org_id, :prospect_id, :conversation_id, :channel, 'outbound', :body, :ai_generated, now())
        returning id, org_id, prospect_id, conversation_id, channel, direction, subject, body, sent_at, read_at, ai_generated
        """,
        {
            "org_id": principal.org_id,
            "prospect_id": conversation["prospect_id"],
            "conversation_id": conversation_id,
            "channel": body.channel,
            "body": body.body,
            "ai_generated": body.ai_generated,
        },
    )

    await execute(
        conn,
        "update conversations set last_message_at = now() where id = :id and org_id = :org_id",
        {"id": conversation_id, "org_id": principal.org_id},
    )

    actor = "ai" if body.ai_generated and conversation["autopilot_enabled"] else "human"
    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
        values (:org_id, 'conversation', :id, 'reply_sent', :detail, :actor)
        """,
        {
            "org_id": principal.org_id,
            "id": conversation_id,
            "detail": f"Replied to {conversation['full_name']}",
            "actor": actor,
        },
    )

    return message


@router.post("/{conversation_id}/generate-reply", response_model=GeneratedText)
async def generate_reply(
    conversation_id: str,
    body: GenerateReplyRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    """Drafts a reply. Deliberately does NOT send it."""
    rate_limit(f"draft:{principal.org_id}", limit=120, window_seconds=3600)

    conversation = await fetch_one(
        conn,
        """
        select c.id, c.intent_tag, p.full_name, p.title, p.company, p.signals
        from conversations c join prospects p on p.id = c.prospect_id
        where c.id = :id and c.org_id = :org_id
        """,
        {"id": conversation_id, "org_id": principal.org_id},
    )
    if not conversation:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")

    history = await fetch_all(
        conn,
        """
        select direction, body from messages
        where conversation_id = :id and org_id = :org_id
        order by sent_at asc
        """,
        {"id": conversation_id, "org_id": principal.org_id},
    )

    settings_row = await fetch_one(
        conn, "select booking_url from org_settings where org_id = :org_id", {"org_id": principal.org_id}
    )

    try:
        text = await ai.draft_reply(
            prospect_name=conversation["full_name"],
            prospect_title=conversation.get("title"),
            company=conversation.get("company"),
            signals=list(conversation.get("signals") or []),
            intent_tag=conversation["intent_tag"],
            history=[{"direction": row["direction"], "body": row["body"]} for row in history],
            booking_url=(settings_row or {}).get("booking_url"),
        )
    except ai.AIUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Reply generation failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not draft a reply.") from exc

    return {"text": text}


@router.patch("/{conversation_id}/autopilot")
async def set_autopilot(
    conversation_id: str,
    body: AutopilotRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    updated = await fetch_one(
        conn,
        """
        update conversations set autopilot_enabled = :enabled
        where id = :id and org_id = :org_id
        returning id
        """,
        {"id": conversation_id, "org_id": principal.org_id, "enabled": body.enabled},
    )
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")

    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
        values (:org_id, 'conversation', :id, 'autopilot_toggled', :detail, 'human')
        """,
        {
            "org_id": principal.org_id,
            "id": conversation_id,
            "detail": f"Autopilot {'enabled' if body.enabled else 'disabled'}",
        },
    )

    return {"ok": True, "enabled": body.enabled}


@router.patch("/{conversation_id}/intent")
async def set_intent(
    conversation_id: str,
    body: IntentRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    updated = await fetch_one(
        conn,
        "update conversations set intent_tag = :tag where id = :id and org_id = :org_id returning id",
        {"id": conversation_id, "org_id": principal.org_id, "tag": body.intent_tag},
    )
    if not updated:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Conversation not found")
    return {"ok": True}
