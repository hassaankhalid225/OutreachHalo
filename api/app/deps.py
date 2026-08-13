import logging
from dataclasses import dataclass
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.concurrency import run_in_threadpool
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient, PyJWKClientError

from app.config import settings
from app.db import fetch_one, get_engine

logger = logging.getLogger(__name__)

bearer = HTTPBearer(auto_error=False)

ASYMMETRIC_ALGS = ("ES256", "RS256", "EdDSA")


@dataclass(frozen=True)
class Principal:
    """The authenticated caller, already resolved to a tenant."""

    user_id: str
    org_id: str
    email: str | None
    role: str


@lru_cache(maxsize=4)
def _jwk_client(jwks_url: str) -> PyJWKClient:
    """Cached per URL — the client keeps its own key cache and refreshes on miss."""
    return PyJWKClient(jwks_url, cache_keys=True, lifespan=600, timeout=10)


async def _decode_token(token: str) -> dict:
    """
    Verify a Supabase access token.

    Supabase projects sign with either:
      * an asymmetric key (ES256/RS256) published at the project's JWKS endpoint —
        the current default, and what this project uses; or
      * a legacy HS256 shared secret (Settings → API → JWT Secret).

    The algorithm is read from the token header purely to choose a verification
    path. That is safe here because each branch is pinned to its own key
    material: the HS256 branch only ever uses the configured shared secret, so a
    token forged with HS256 over the public key — the classic algorithm-confusion
    attack — cannot verify.
    """
    try:
        alg = jwt.get_unverified_header(token).get("alg")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Malformed token") from exc

    common = {
        "audience": settings.supabase_jwt_audience,
        "options": {"require": ["exp", "sub"]},
    }
    if settings.supabase_url:
        common["issuer"] = f"{settings.supabase_url.rstrip('/')}/auth/v1"

    try:
        # A token we have no key material for is an unverifiable token, which is
        # a 401 — not a 503. Returning "service unavailable" would let anyone
        # make the API look unhealthy just by presenting a token signed with an
        # algorithm we do not accept. The operator signal goes to the log.
        if alg in ASYMMETRIC_ALGS:
            if not settings.supabase_url:
                logger.error("Asymmetric token received but SUPABASE_URL is not configured")
                raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token cannot be verified")
            return await _verify_asymmetric(token, common)

        if alg == "HS256":
            if not settings.supabase_jwt_secret:
                logger.error("HS256 token received but SUPABASE_JWT_SECRET is not configured")
                raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token cannot be verified")
            return jwt.decode(token, settings.supabase_jwt_secret, algorithms=["HS256"], **common)

    except jwt.ExpiredSignatureError as exc:
        logger.info("Rejected token: expired")
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired") from exc
    except jwt.InvalidTokenError as exc:
        # Log the reason — "Invalid token" alone makes misconfiguration
        # (wrong audience, wrong issuer, clock skew) impossible to diagnose.
        logger.warning("Rejected token: %s: %s", type(exc).__name__, exc)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token") from exc
    except PyJWKClientError as exc:
        logger.warning("Rejected token: no signing key: %s", exc)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Signing key not found") from exc

    raise HTTPException(status.HTTP_401_UNAUTHORIZED, f"Unsupported token algorithm: {alg}")


async def _verify_asymmetric(token: str, common: dict, *, allow_retry: bool = True) -> dict:
    """
    Verify against the project's JWKS, refreshing the key set once on failure.

    Signing keys rotate, and a cached key set will outlive a rotation. Rather
    than 401-ing every request until the cache lapses, drop the client and retry
    once — the second failure is a real rejection.
    """
    jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"

    try:
        # PyJWKClient is synchronous and may hit the network on a cache miss.
        signing_key = await run_in_threadpool(
            _jwk_client(jwks_url).get_signing_key_from_jwt, token
        )
        return jwt.decode(token, signing_key.key, algorithms=list(ASYMMETRIC_ALGS), **common)
    except (jwt.InvalidSignatureError, PyJWKClientError) as exc:
        if not allow_retry:
            raise
        logger.warning(
            "JWKS verification failed (%s) — refreshing the key set and retrying once",
            type(exc).__name__,
        )
        _jwk_client.cache_clear()
        return await _verify_asymmetric(token, common, allow_retry=False)


async def get_principal(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
) -> Principal:
    """
    Resolves the caller from their Supabase access token.

    `org_id` is read from the database using the token's subject — it is never
    taken from the request body or a header, so a client cannot address another
    tenant's data even if it tries.

    The token is validated before any database work happens, so anonymous or
    forged traffic never opens a connection.
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")

    claims = await _decode_token(credentials.credentials)
    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token has no subject")

    engine = get_engine()
    async with engine.connect() as lookup:
        profile = await fetch_one(
            lookup,
            "select id, org_id, email, role from profiles where id = :user_id",
            {"user_id": user_id},
        )

    if not profile or not profile.get("org_id"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "No workspace for this user")

    return Principal(
        user_id=str(profile["id"]),
        org_id=str(profile["org_id"]),
        email=profile.get("email"),
        role=profile.get("role") or "member",
    )


async def require_owner(principal: Principal = Depends(get_principal)) -> Principal:
    if principal.role not in {"owner", "admin"}:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Owner or admin role required")
    return principal


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
