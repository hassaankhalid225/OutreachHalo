import logging

from fastapi import APIRouter, HTTPException, Request, status

from app.deps import client_ip
from app.rate_limit import rate_limit
from app.schemas import GeneratedText, ToolRequest
from app.services import ai

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/tools", tags=["tools"])


@router.post("/generate", response_model=GeneratedText)
async def generate(body: ToolRequest, request: Request):
    """
    Powers the public free tools on the marketing site.

    Unauthenticated by design — these are lead magnets — so it is rate limited
    per IP and capped in output length.
    """
    rate_limit(f"tools:{client_ip(request)}", limit=12, window_seconds=3600)

    try:
        text = await ai.run_tool(body.kind, body.input)
    except ai.AIUnavailable as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        logger.exception("Free tool generation failed")
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, "Generation failed. Please try again.") from exc

    return {"text": text}
