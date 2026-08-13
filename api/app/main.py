import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.db import dispose_engine
from app.routes import billing, content, inbox, onboarding, prospects, sequences, tools, workspace

logging.basicConfig(
    level=logging.INFO if settings.environment != "development" else logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info(
        "Starting %s — database:%s ai:%s stripe:%s",
        settings.app_name,
        "yes" if settings.has_database else "NO",
        f"{settings.active_ai_provider} ({settings.active_ai_model})" if settings.has_ai else "NO",
        "yes" if settings.has_stripe else "NO",
    )
    yield
    await dispose_engine()


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description=(
        "Backend for OutreachHalo. Every endpoint under /api derives `org_id` from the "
        "caller's Supabase JWT and scopes its queries by it, in addition to the "
        "row-level security policies enforced in Postgres."
    ),
    lifespan=lifespan,
    docs_url="/docs" if settings.environment != "production" else None,
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["authorization", "content-type", "stripe-signature"],
    max_age=600,
)


@app.exception_handler(RuntimeError)
async def runtime_error_handler(_: Request, exc: RuntimeError):
    """A missing DATABASE_URL should read as a clear 503, not a stack trace."""
    logger.error("Runtime error: %s", exc)
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"detail": str(exc)},
    )


def _sdk_available(provider: str | None) -> bool | None:
    """
    Is the selected provider's SDK actually importable in THIS interpreter?

    A configured key with a missing package fails at the first generation with a
    ModuleNotFoundError, which is a confusing way to find out. Surfacing it here
    means one curl answers the question.
    """
    if provider is None:
        return None
    try:
        if provider == "anthropic":
            import anthropic  # noqa: F401
        elif provider == "gemini":
            from google import genai  # noqa: F401
        else:
            return False
    except ImportError:
        return False
    return True


@app.get("/health", tags=["meta"])
async def health():
    provider = settings.active_ai_provider
    return {
        "status": "ok",
        "environment": settings.environment,
        "database_configured": settings.has_database,
        "ai_configured": settings.has_ai,
        "ai_provider": provider,
        "ai_model": settings.active_ai_model,
        "ai_sdk_available": _sdk_available(provider),
        "stripe_configured": settings.has_stripe,
    }


for router in (
    onboarding.router,
    prospects.router,
    sequences.router,
    inbox.router,
    content.router,
    workspace.router,
    billing.router,
    tools.router,
):
    app.include_router(router, prefix="/api")
