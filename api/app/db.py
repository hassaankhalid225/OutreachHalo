from collections.abc import AsyncIterator
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, create_async_engine

from app.config import settings

_engine: AsyncEngine | None = None


def _normalise_url(raw: str) -> tuple[str, str | None]:
    """
    Turn a stock Postgres URI into one SQLAlchemy's asyncpg dialect accepts.

    Two things need handling:
      * the driver prefix — Supabase hands out `postgresql://`;
      * `sslmode`, which is a libpq option. asyncpg does not accept it as a
        keyword and errors out, so it is lifted out of the query string here and
        passed through as asyncpg's own `ssl` argument.
    """
    url = raw
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    sslmode = query.pop("sslmode", None)

    # The dialect's own prepared-statement cache is configured through the URL,
    # not through create_engine(). It has to be off behind a connection pooler.
    query.setdefault("prepared_statement_cache_size", "0")

    rebuilt = urlunsplit(parts._replace(query=urlencode(query)))

    if sslmode is None and parts.hostname and parts.hostname.endswith((".supabase.com", ".supabase.co")):
        # Supabase requires TLS; asyncpg would otherwise attempt a plaintext
        # connection and be refused.
        sslmode = "require"

    return rebuilt, sslmode


def get_engine() -> AsyncEngine:
    """Lazily-created engine so importing the app never requires a database."""
    global _engine
    if _engine is None:
        if not settings.has_database:
            raise RuntimeError(
                "DATABASE_URL is not set. Point it at your Supabase Postgres connection string."
            )

        url, sslmode = _normalise_url(settings.database_url)

        connect_args: dict[str, Any] = {
            # Supabase's pooler cannot reuse prepared statements across sessions.
            "statement_cache_size": 0,
        }
        if sslmode and sslmode != "disable":
            connect_args["ssl"] = sslmode

        _engine = create_async_engine(
            url,
            pool_pre_ping=True,
            pool_size=5,
            max_overflow=10,
            connect_args=connect_args,
        )
    return _engine


async def get_connection() -> AsyncIterator[AsyncConnection]:
    """FastAPI dependency yielding a transactional connection."""
    engine = get_engine()
    async with engine.begin() as connection:
        yield connection


async def fetch_all(conn: AsyncConnection, sql: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    result = await conn.execute(text(sql), params or {})
    return [dict(row) for row in result.mappings().all()]


async def fetch_one(conn: AsyncConnection, sql: str, params: dict[str, Any] | None = None) -> dict[str, Any] | None:
    result = await conn.execute(text(sql), params or {})
    row = result.mappings().first()
    return dict(row) if row else None


async def execute(conn: AsyncConnection, sql: str, params: dict[str, Any] | None = None) -> None:
    await conn.execute(text(sql), params or {})


async def dispose_engine() -> None:
    global _engine
    if _engine is not None:
        await _engine.dispose()
        _engine = None
