import json
import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncConnection

from app.db import execute, fetch_one, get_connection
from app.deps import Principal, client_ip, get_principal
from app.rate_limit import rate_limit
from app.schemas import AnalyzeWebsiteRequest, AnalyzeWebsiteResponse, BusinessProfileRequest, IcpRequest
from app.services import ai
from app.services.scraper import UnsafeUrl, fetch_readable

logger = logging.getLogger(__name__)
router = APIRouter(tags=["onboarding"])


@router.post("/onboarding/analyze-website", response_model=AnalyzeWebsiteResponse)
async def analyze_website(
    body: AnalyzeWebsiteRequest,
    request: Request,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    """Fetch the page server-side, extract readable text, send it to Claude."""
    # Fetching an arbitrary URL on the caller's behalf is abusable — limit it
    # per org as well as per IP.
    rate_limit(f"analyze:org:{principal.org_id}", limit=20, window_seconds=3600)
    rate_limit(f"analyze:ip:{client_ip(request)}", limit=30, window_seconds=3600)

    url = str(body.url)

    try:
        page_text, title = await fetch_readable(url)
    except UnsafeUrl as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    except httpx.HTTPError as exc:
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "That site could not be reached.") from exc
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc

    if len(page_text) < 60:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "There was not enough readable text on that page to analyse.",
        )

    try:
        result = await ai.analyze_website(url, page_text, title)
    except ai.AIUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 — surfaced to the user as a 502
        logger.exception("Website analysis failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "The analysis could not be completed.") from exc

    await execute(
        conn,
        """
        insert into business_profile (org_id, website_url, what_you_sell, who_you_target, how_to_pitch, raw_scrape)
        values (:org_id, :url, :sell, :target, :pitch, :raw)
        """,
        {
            "org_id": principal.org_id,
            "url": url,
            "sell": result["what_you_sell"],
            "target": result["who_you_target"],
            "pitch": result["how_to_pitch"],
            # jsonb columns take a JSON *string* over asyncpg — serialise properly
            # rather than hand-building it, so quotes in the title cannot break it.
            "raw": json.dumps({"title": title, "chars": len(page_text)}),
        },
    )

    return result


@router.get("/business-profile")
async def get_business_profile(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    row = await fetch_one(
        conn,
        """
        select id, org_id, website_url, what_you_sell, who_you_target, how_to_pitch
        from business_profile where org_id = :org_id
        order by created_at desc limit 1
        """,
        {"org_id": principal.org_id},
    )
    return row or {
        "id": None,
        "org_id": principal.org_id,
        "website_url": None,
        "what_you_sell": None,
        "who_you_target": None,
        "how_to_pitch": None,
    }


@router.post("/business-profile")
async def save_business_profile(
    body: BusinessProfileRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    existing = await fetch_one(
        conn,
        "select id from business_profile where org_id = :org_id order by created_at desc limit 1",
        {"org_id": principal.org_id},
    )

    params = {"org_id": principal.org_id, **body.model_dump()}

    if existing:
        params["id"] = existing["id"]
        await execute(
            conn,
            """
            update business_profile
               set website_url = coalesce(:website_url, website_url),
                   what_you_sell = coalesce(:what_you_sell, what_you_sell),
                   who_you_target = coalesce(:who_you_target, who_you_target),
                   how_to_pitch = coalesce(:how_to_pitch, how_to_pitch),
                   updated_at = now()
             where id = :id and org_id = :org_id
            """,
            params,
        )
    else:
        await execute(
            conn,
            """
            insert into business_profile (org_id, website_url, what_you_sell, who_you_target, how_to_pitch)
            values (:org_id, :website_url, :what_you_sell, :who_you_target, :how_to_pitch)
            """,
            params,
        )

    return await get_business_profile(principal, conn)


@router.get("/icp")
async def get_icp(
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    row = await fetch_one(
        conn,
        """
        select id, org_id, job_titles, company_size_min, company_size_max,
               industries, geographies, keywords
        from icp_profiles where org_id = :org_id
        order by created_at desc limit 1
        """,
        {"org_id": principal.org_id},
    )
    return row or {
        "id": None,
        "org_id": principal.org_id,
        "job_titles": [],
        "company_size_min": 1,
        "company_size_max": 250,
        "industries": [],
        "geographies": [],
        "keywords": [],
    }


@router.post("/icp")
async def save_icp(
    body: IcpRequest,
    principal: Principal = Depends(get_principal),
    conn: AsyncConnection = Depends(get_connection),
):
    existing = await fetch_one(
        conn,
        "select id from icp_profiles where org_id = :org_id order by created_at desc limit 1",
        {"org_id": principal.org_id},
    )

    params = {"org_id": principal.org_id, **body.model_dump()}

    if existing:
        params["id"] = existing["id"]
        await execute(
            conn,
            """
            update icp_profiles
               set job_titles = :job_titles,
                   company_size_min = :company_size_min,
                   company_size_max = :company_size_max,
                   industries = :industries,
                   geographies = :geographies,
                   keywords = :keywords,
                   updated_at = now()
             where id = :id and org_id = :org_id
            """,
            params,
        )
    else:
        await execute(
            conn,
            """
            insert into icp_profiles (org_id, job_titles, company_size_min, company_size_max,
                                      industries, geographies, keywords)
            values (:org_id, :job_titles, :company_size_min, :company_size_max,
                    :industries, :geographies, :keywords)
            """,
            params,
        )

    return await get_icp(principal, conn)
