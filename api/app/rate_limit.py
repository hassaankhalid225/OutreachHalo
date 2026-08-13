"""
Fixed-window in-process rate limiter.

Sufficient for a single API instance; swap the dict for Redis when you scale
horizontally — the call signature is deliberately identical.
"""

from __future__ import annotations

import time
from threading import Lock

from fastapi import HTTPException, status

_buckets: dict[str, tuple[int, float]] = {}
_lock = Lock()


def rate_limit(key: str, limit: int, window_seconds: int) -> None:
    """Raises 429 when the caller has exceeded `limit` hits in the window."""
    now = time.monotonic()

    with _lock:
        count, reset_at = _buckets.get(key, (0, 0.0))

        if reset_at <= now:
            _buckets[key] = (1, now + window_seconds)
            return

        if count >= limit:
            retry_after = max(1, int(reset_at - now))
            raise HTTPException(
                status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Try again shortly.",
                headers={"Retry-After": str(retry_after)},
            )

        _buckets[key] = (count + 1, reset_at)

        # Opportunistic cleanup so the dict cannot grow without bound.
        if len(_buckets) > 10_000:
            for stale_key, (_, expiry) in list(_buckets.items()):
                if expiry <= now:
                    _buckets.pop(stale_key, None)
