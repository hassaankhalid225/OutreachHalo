from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.db import execute, fetch_all, fetch_one, get_connection
from app.deps import Principal, get_principal
from app.schemas import EnrollRequest, SequenceCreate, SequenceUpdate, StepsRequest

router = APIRouter(prefix="/sequences", tags=["sequences"])

# Steps are nested and the three counters are derived, so the list and detail
# endpoints share one query shape rather than N+1-ing per sequence.
SEQUENCE_SELECT = """
select s.id, s.org_id, s.name, s.description, s.status, s.approval_mode, s.created_at,
       coalesce(
         (select json_agg(json_build_object(
            'id', st.id, 'sequence_id', st.sequence_id, 'step_order', st.step_order,
            'channel', st.channel, 'delay_days', st.delay_days, 'subject', st.subject,
            'message_template', st.message_template, 'ai_personalize', st.ai_personalize)
            order by st.step_order)
          from sequence_steps st where st.sequence_id = s.id), '[]'::json) as steps,
       (select count(*) from sequence_enrollments e where e.sequence_id = s.id) as enrolled_count,
       (select count(*) from sequence_enrollments e
          join prospects p on p.id = e.prospect_id
         where e.sequence_id = s.id and p.sequence_status = 'replied') as replied_count,
       (select count(*) from sequence_enrollments e
          join conversations c on c.prospect_id = e.prospect_id
         where e.sequence_id = s.id and c.meeting_booked_at is not null) as meetings_booked
from sequences s
where s.org_id = :org_id
"""


def _with_reply_rate(row: dict) -> dict:
    enrolled = int(row.get("enrolled_count") or 0)
    replied = int(row.get("replied_count") or 0)
    row["enrolled_count"] = enrolled
    row["replied_count"] = replied
    row["meetings_booked"] = int(row.get("meetings_booked") or 0)
    row["reply_rate"] = round(replied / enrolled * 100, 1) if enrolled else 0.0
    return row


@router.get("")
async def list_sequences(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    rows = await fetch_all(conn, f"{SEQUENCE_SELECT} order by s.created_at desc", {"org_id": principal.org_id})
    return [_with_reply_rate(row) for row in rows]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_sequence(
    body: SequenceCreate,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    created = await fetch_one(
        conn,
        """
        insert into sequences (org_id, name, description, status, approval_mode)
        values (:org_id, :name, :description, 'draft', 'approve_first')
        returning id
        """,
        {"org_id": principal.org_id, "name": body.name, "description": body.description},
    )

    # A sequence with no steps is not editable in the builder, so seed step one.
    await execute(
        conn,
        """
        insert into sequence_steps (sequence_id, org_id, step_order, channel, delay_days, message_template, ai_personalize)
        values (:sequence_id, :org_id, 1, 'linkedin', 0,
                'Hey {{first_name}}, noticed {{company}} is {{signal}}. Worth a quick conversation?', true)
        """,
        {"sequence_id": created["id"], "org_id": principal.org_id},
    )

    await execute(
        conn,
        """
        insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
        values (:org_id, 'sequence', :id, 'sequence_created', :detail, 'human')
        """,
        {"org_id": principal.org_id, "id": created["id"], "detail": f'Created sequence "{body.name}"'},
    )

    row = await fetch_one(conn, f"{SEQUENCE_SELECT} and s.id = :id", {"org_id": principal.org_id, "id": created["id"]})
    return _with_reply_rate(row) if row else {"id": str(created["id"])}


@router.get("/{sequence_id}")
async def get_sequence(
    sequence_id: str,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    row = await fetch_one(
        conn, f"{SEQUENCE_SELECT} and s.id = :id", {"org_id": principal.org_id, "id": sequence_id}
    )
    if not row:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sequence not found")

    enrollments = await fetch_all(
        conn,
        """
        select sequence_id, prospect_id, current_step, status
        from sequence_enrollments where sequence_id = :id and org_id = :org_id
        """,
        {"id": sequence_id, "org_id": principal.org_id},
    )

    prospects = await fetch_all(
        conn,
        """
        select p.id, p.org_id, p.full_name, p.title, p.company, p.avatar_url, p.linkedin_url,
               p.location, p.company_size, p.industry, p.fit_score, p.intent_level, p.signals,
               p.source, p.sequence_status, p.last_activity_at, p.created_at
        from prospects p
        join sequence_enrollments e on e.prospect_id = p.id
        where e.sequence_id = :id and p.org_id = :org_id
        order by p.fit_score desc
        """,
        {"id": sequence_id, "org_id": principal.org_id},
    )

    return {"sequence": _with_reply_rate(row), "enrollments": enrollments, "prospects": prospects}


@router.put("/{sequence_id}")
async def update_sequence(
    sequence_id: str,
    body: SequenceUpdate,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    patch = body.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nothing to update")

    assignments = ", ".join(f"{column} = :{column}" for column in patch)
    result = await fetch_one(
        conn,
        f"update sequences set {assignments} where id = :id and org_id = :org_id returning id",
        {**patch, "id": sequence_id, "org_id": principal.org_id},
    )
    if not result:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sequence not found")

    if "status" in patch:
        await execute(
            conn,
            """
            insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
            values (:org_id, 'sequence', :id, 'sequence_status', :detail, 'human')
            """,
            {"org_id": principal.org_id, "id": sequence_id, "detail": f"Sequence set to {patch['status']}"},
        )

    row = await fetch_one(conn, f"{SEQUENCE_SELECT} and s.id = :id", {"org_id": principal.org_id, "id": sequence_id})
    return _with_reply_rate(row) if row else {"ok": True}


@router.post("/{sequence_id}/steps")
async def replace_steps(
    sequence_id: str,
    body: StepsRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    owned = await fetch_one(
        conn,
        "select id from sequences where id = :id and org_id = :org_id",
        {"id": sequence_id, "org_id": principal.org_id},
    )
    if not owned:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sequence not found")

    # Replace wholesale — the builder always posts the complete ordered list.
    await execute(
        conn,
        "delete from sequence_steps where sequence_id = :id and org_id = :org_id",
        {"id": sequence_id, "org_id": principal.org_id},
    )

    for index, step in enumerate(body.steps, start=1):
        await execute(
            conn,
            """
            insert into sequence_steps (sequence_id, org_id, step_order, channel, delay_days,
                                        subject, message_template, ai_personalize)
            values (:sequence_id, :org_id, :step_order, :channel, :delay_days,
                    :subject, :message_template, :ai_personalize)
            """,
            {
                "sequence_id": sequence_id,
                "org_id": principal.org_id,
                "step_order": index,
                "channel": step.channel,
                "delay_days": step.delay_days,
                "subject": step.subject,
                "message_template": step.message_template,
                "ai_personalize": step.ai_personalize,
            },
        )

    row = await fetch_one(conn, f"{SEQUENCE_SELECT} and s.id = :id", {"org_id": principal.org_id, "id": sequence_id})
    return _with_reply_rate(row) if row else {"ok": True}


@router.post("/{sequence_id}/enroll")
async def enroll(
    sequence_id: str,
    body: EnrollRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    owned = await fetch_one(
        conn,
        "select id, name from sequences where id = :id and org_id = :org_id",
        {"id": sequence_id, "org_id": principal.org_id},
    )
    if not owned:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sequence not found")

    await execute(
        conn,
        """
        insert into sequence_enrollments (sequence_id, prospect_id, org_id, current_step, status)
        select :sequence_id, p.id, :org_id, 1, 'active'
        from prospects p
        where p.org_id = :org_id and p.id = any(cast(:prospect_ids as uuid[]))
        on conflict (sequence_id, prospect_id) do nothing
        """,
        {"sequence_id": sequence_id, "org_id": principal.org_id, "prospect_ids": body.prospect_ids},
    )

    await execute(
        conn,
        """
        update prospects set sequence_status = 'in_sequence'
        where org_id = :org_id and id = any(cast(:prospect_ids as uuid[])) and sequence_status = 'not_started'
        """,
        {"org_id": principal.org_id, "prospect_ids": body.prospect_ids},
    )

    return {"ok": True, "enrolled": len(body.prospect_ids)}
