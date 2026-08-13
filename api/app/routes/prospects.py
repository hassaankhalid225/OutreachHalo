from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.db import execute, fetch_all, fetch_one, get_connection
from app.deps import Principal, get_principal
from app.schemas import AddToSequenceRequest, FeedbackRequest

router = APIRouter(prefix="/prospects", tags=["prospects"])

PROSPECT_COLUMNS = """
    id, org_id, full_name, title, company, avatar_url, linkedin_url, location,
    company_size, industry, fit_score, intent_level, signals, source,
    sequence_status, last_activity_at, created_at
"""


@router.get("/signals")
async def signal_options(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
) -> list[str]:
    """Every distinct signal in this workspace — powers the filter chips."""
    rows = await fetch_all(
        conn,
        """
        select distinct jsonb_array_elements_text(signals) as signal
        from prospects
        where org_id = :org_id
        order by signal
        """,
        {"org_id": principal.org_id},
    )
    return [row["signal"] for row in rows]


@router.get("")
async def list_prospects(
    fit_min: int = Query(0, ge=0, le=100),
    fit_max: int = Query(100, ge=0, le=100),
    intent: list[str] = Query(default_factory=list),
    signal: list[str] = Query(default_factory=list),
    seq_status: str = Query("all"),
    source: str = Query("all"),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    """
    Server-side filtering and pagination.

    `org_id` comes from the verified token, never from the query string, so a
    crafted request cannot read another workspace.
    """
    where = ["org_id = :org_id", "fit_score between :fit_min and :fit_max"]
    params: dict = {
        "org_id": principal.org_id,
        "fit_min": fit_min,
        "fit_max": fit_max,
        "limit": page_size,
        "offset": (page - 1) * page_size,
    }

    valid_intents = [value for value in intent if value in {"hot", "warm", "cold"}]
    if valid_intents:
        where.append("intent_level = any(:intents)")
        params["intents"] = valid_intents

    if signal:
        # Match a prospect carrying ANY of the selected signals.
        # Written as an EXISTS rather than the `?|` jsonb operator: `?` is a
        # parameter marker in several drivers and gets mangled in transit.
        where.append(
            "exists (select 1 from jsonb_array_elements_text(signals) as s(value)"
            " where s.value = any(:signals))"
        )
        params["signals"] = signal

    if seq_status in {"not_started", "in_sequence", "replied", "closed"}:
        where.append("sequence_status = :seq_status")
        params["seq_status"] = seq_status

    if source in {"linkedin_search", "content_engagement"}:
        where.append("source = :source")
        params["source"] = source

    if search.strip():
        where.append("(full_name ilike :search or company ilike :search or title ilike :search)")
        params["search"] = f"%{search.strip()}%"

    clause = " and ".join(where)

    total_row = await fetch_one(conn, f"select count(*) as total from prospects where {clause}", params)
    total = int(total_row["total"]) if total_row else 0
    total_pages = max(1, -(-total // page_size))

    items = await fetch_all(
        conn,
        f"""
        select {PROSPECT_COLUMNS}
        from prospects
        where {clause}
        order by fit_score desc, last_activity_at desc
        limit :limit offset :offset
        """,
        params,
    )

    return {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
    }


@router.get("/{prospect_id}")
async def get_prospect(
    prospect_id: str,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    prospect = await fetch_one(
        conn,
        f"select {PROSPECT_COLUMNS} from prospects where id = :id and org_id = :org_id",
        {"id": prospect_id, "org_id": principal.org_id},
    )
    if not prospect:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Prospect not found")

    messages = await fetch_all(
        conn,
        """
        select id, org_id, prospect_id, conversation_id, channel, direction, subject,
               body, sent_at, read_at, ai_generated
        from messages
        where prospect_id = :id and org_id = :org_id and conversation_id is not null
        order by sent_at asc
        """,
        {"id": prospect_id, "org_id": principal.org_id},
    )

    enrollment = await fetch_one(
        conn,
        """
        select sequence_id, current_step, status
        from sequence_enrollments
        where prospect_id = :id and org_id = :org_id
        order by enrolled_at desc limit 1
        """,
        {"id": prospect_id, "org_id": principal.org_id},
    )

    sequence = None
    if enrollment:
        sequence = await fetch_one(
            conn,
            """
            select s.id, s.org_id, s.name, s.description, s.status, s.approval_mode, s.created_at,
                   coalesce(
                     (select json_agg(json_build_object(
                        'id', st.id, 'sequence_id', st.sequence_id, 'step_order', st.step_order,
                        'channel', st.channel, 'delay_days', st.delay_days, 'subject', st.subject,
                        'message_template', st.message_template, 'ai_personalize', st.ai_personalize)
                        order by st.step_order)
                      from sequence_steps st where st.sequence_id = s.id), '[]'::json) as steps
            from sequences s
            where s.id = :sequence_id and s.org_id = :org_id
            """,
            {"sequence_id": enrollment["sequence_id"], "org_id": principal.org_id},
        )

    conversation = await fetch_one(
        conn,
        """
        select id, org_id, prospect_id, intent_tag, autopilot_enabled, meeting_booked_at, last_message_at
        from conversations where prospect_id = :id and org_id = :org_id
        """,
        {"id": prospect_id, "org_id": principal.org_id},
    )

    feedback = await fetch_one(
        conn,
        """
        select is_good_fit from prospect_feedback
        where prospect_id = :id and org_id = :org_id
        order by created_at desc limit 1
        """,
        {"id": prospect_id, "org_id": principal.org_id},
    )

    return {
        "prospect": prospect,
        "messages": messages,
        "enrollment": enrollment,
        "sequence": sequence,
        "conversation": conversation,
        "feedback": feedback,
    }


@router.post("/{prospect_id}/feedback")
async def submit_feedback(
    prospect_id: str,
    body: FeedbackRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    prospect = await fetch_one(
        conn,
        "select id, full_name, fit_score from prospects where id = :id and org_id = :org_id",
        {"id": prospect_id, "org_id": principal.org_id},
    )
    if not prospect:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Prospect not found")

    await execute(
        conn,
        """
        insert into prospect_feedback (prospect_id, org_id, is_good_fit)
        values (:prospect_id, :org_id, :is_good_fit)
        """,
        {"prospect_id": prospect_id, "org_id": principal.org_id, "is_good_fit": body.is_good_fit},
    )

    # Visible payoff: the score moves now. Phase 2 replaces this with a real
    # re-ranking pass over the whole workspace.
    delta = 4 if body.is_good_fit else -12
    await execute(
        conn,
        """
        update prospects
           set fit_score = greatest(0, least(100, fit_score + :delta)),
               intent_level = case
                 when greatest(0, least(100, fit_score + :delta)) >= 85 then 'hot'
                 when greatest(0, least(100, fit_score + :delta)) >= 65 then 'warm'
                 else 'cold' end
         where id = :id and org_id = :org_id
        """,
        {"id": prospect_id, "org_id": principal.org_id, "delta": delta},
    )

    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
        values (:org_id, 'prospect', :id, 'feedback', :detail, 'human')
        """,
        {
            "org_id": principal.org_id,
            "id": prospect_id,
            "detail": f"You marked {prospect['full_name']} as {'a good' if body.is_good_fit else 'a bad'} fit",
        },
    )

    return {"ok": True}


@router.post("/{prospect_id}/add-to-sequence")
async def add_to_sequence(
    prospect_id: str,
    body: AddToSequenceRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    sequence = await fetch_one(
        conn,
        "select id, name from sequences where id = :id and org_id = :org_id",
        {"id": body.sequence_id, "org_id": principal.org_id},
    )
    prospect = await fetch_one(
        conn,
        "select id, full_name from prospects where id = :id and org_id = :org_id",
        {"id": prospect_id, "org_id": principal.org_id},
    )
    if not sequence or not prospect:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sequence or prospect not found")

    await execute(
        conn,
        """
        insert into sequence_enrollments (sequence_id, prospect_id, org_id, current_step, status)
        values (:sequence_id, :prospect_id, :org_id, 1, 'active')
        on conflict (sequence_id, prospect_id) do nothing
        """,
        {"sequence_id": body.sequence_id, "prospect_id": prospect_id, "org_id": principal.org_id},
    )

    await execute(
        conn,
        """
        update prospects set sequence_status = 'in_sequence'
        where id = :id and org_id = :org_id and sequence_status = 'not_started'
        """,
        {"id": prospect_id, "org_id": principal.org_id},
    )

    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
        values (:org_id, 'sequence', :sequence_id, 'sequence_enroll', :detail, 'human')
        """,
        {
            "org_id": principal.org_id,
            "sequence_id": body.sequence_id,
            "detail": f"Added {prospect['full_name']} to \"{sequence['name']}\"",
        },
    )

    return {"ok": True}
