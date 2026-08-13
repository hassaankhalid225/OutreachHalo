import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.db import execute, fetch_all, fetch_one, get_connection
from app.deps import Principal, get_principal
from app.rate_limit import rate_limit
from app.schemas import GeneratePostRequest, GeneratedText, PostCreate, PostPatch, VoiceSampleRequest
from app.services import ai

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/content", tags=["content"])

POST_COLUMNS = """
    id, org_id, body_text, image_url, status, scheduled_at, posted_at,
    reactions_count, comments_count, leads_generated_count, created_at
"""


def _parse_dt(value: str | None) -> datetime | None:
    """
    ISO-8601 string → datetime.

    asyncpg refuses a plain string for a timestamptz parameter, so the
    conversion has to happen here rather than being left to the database.
    """
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Invalid date and time.") from exc


@router.get("")
async def list_posts(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    return await fetch_all(
        conn,
        f"select {POST_COLUMNS} from content_posts where org_id = :org_id order by created_at desc",
        {"org_id": principal.org_id},
    )


@router.get("/voice")
async def get_voice_sample(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    return await fetch_one(
        conn,
        """
        select id, org_id, sample_text, created_at from voice_samples
        where org_id = :org_id order by created_at desc limit 1
        """,
        {"org_id": principal.org_id},
    )


@router.post("/voice")
async def save_voice_sample(
    body: VoiceSampleRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    row = await fetch_one(
        conn,
        """
        insert into voice_samples (org_id, sample_text) values (:org_id, :sample_text)
        returning id, org_id, sample_text, created_at
        """,
        {"org_id": principal.org_id, "sample_text": body.sample_text},
    )
    return row


@router.post("/generate", response_model=GeneratedText)
async def generate(
    body: GeneratePostRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    rate_limit(f"post:{principal.org_id}", limit=60, window_seconds=3600)

    # Prefer stored context over whatever the client sent, so a stale client
    # cannot generate against another workspace's voice.
    voice = await fetch_one(
        conn,
        "select sample_text from voice_samples where org_id = :org_id order by created_at desc limit 1",
        {"org_id": principal.org_id},
    )
    business = await fetch_one(
        conn,
        """
        select what_you_sell, who_you_target from business_profile
        where org_id = :org_id order by created_at desc limit 1
        """,
        {"org_id": principal.org_id},
    )

    try:
        text = await ai.generate_post(
            brief=body.brief,
            voice_sample=(voice or {}).get("sample_text") or body.voice_sample,
            what_you_sell=(business or {}).get("what_you_sell") or body.what_you_sell,
            audience=(business or {}).get("who_you_target") or body.audience,
        )
    except ai.AIUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Post generation failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Could not write a post.") from exc

    return {"text": text}


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_post(
    body: PostCreate,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    if body.status == "scheduled" and not body.scheduled_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "A scheduled post needs a date and time.")

    row = await fetch_one(
        conn,
        f"""
        insert into content_posts (org_id, body_text, status, scheduled_at, posted_at)
        values (:org_id, :body_text, :status, :scheduled_at,
                case when :status = 'posted' then now() else null end)
        returning {POST_COLUMNS}
        """,
        {
            "org_id": principal.org_id,
            "body_text": body.body_text,
            "status": body.status,
            "scheduled_at": _parse_dt(body.scheduled_at),
        },
    )

    if body.status != "draft":
        await _count_post_usage(conn, principal.org_id)
        await execute(
            conn,
            """
            insert into automation_log (org_id, entity_type, entity_id, action, detail, actor)
            values (:org_id, 'content', :id, :action, :detail, 'human')
            """,
            {
                "org_id": principal.org_id,
                "id": row["id"],
                "action": "post_published" if body.status == "posted" else "post_scheduled",
                "detail": f"{'Published' if body.status == 'posted' else 'Scheduled'} a LinkedIn post",
            },
        )

    return row


@router.patch("/{post_id}")
async def update_post(
    post_id: str,
    body: PostPatch,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    patch = body.model_dump(exclude_none=True)
    if not patch:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Nothing to update")

    if "scheduled_at" in patch:
        patch["scheduled_at"] = _parse_dt(patch["scheduled_at"])

    existing = await fetch_one(
        conn,
        "select status from content_posts where id = :id and org_id = :org_id",
        {"id": post_id, "org_id": principal.org_id},
    )
    if not existing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Post not found")

    assignments = ", ".join(f"{column} = :{column}" for column in patch)
    if patch.get("status") == "posted":
        assignments += ", posted_at = coalesce(posted_at, now())"

    row = await fetch_one(
        conn,
        f"update content_posts set {assignments} where id = :id and org_id = :org_id returning {POST_COLUMNS}",
        {**patch, "id": post_id, "org_id": principal.org_id},
    )

    if existing["status"] == "draft" and patch.get("status") in {"scheduled", "posted"}:
        await _count_post_usage(conn, principal.org_id)

    return row


@router.post("/{post_id}/schedule")
async def schedule_post(
    post_id: str,
    body: PostPatch,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    if not body.scheduled_at:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "scheduled_at is required")
    return await update_post(post_id, PostPatch(status="scheduled", scheduled_at=body.scheduled_at), principal, conn)


@router.post("/{post_id}/publish")
async def publish_post(
    post_id: str,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    # TODO: requires the Phase 2 LinkedIn publishing integration. The row is
    # marked posted so downstream engagement tracking has something to attach to.
    return await update_post(post_id, PostPatch(status="posted"), principal, conn)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    await execute(
        conn,
        "delete from content_posts where id = :id and org_id = :org_id",
        {"id": post_id, "org_id": principal.org_id},
    )


async def _count_post_usage(conn: AsyncConnection, org_id: str) -> None:
    await execute(
        conn,
        """
        update usage_counters set posts_used = posts_used + 1
        where org_id = :org_id and now() between period_start and period_end
        """,
        {"org_id": org_id},
    )
