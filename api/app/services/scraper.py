"""Server-side page fetch used by the onboarding website analysis."""

from __future__ import annotations

import ipaddress
import logging
import socket
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup

from app.config import settings

logger = logging.getLogger(__name__)

USER_AGENT = "OutreachHalo/1.0 (+https://outreachhalo.com; website analysis for the account owner)"

_BLOCKED_SCHEMES = {"file", "ftp", "gopher", "data"}


class UnsafeUrl(ValueError):
    """The URL points somewhere we refuse to fetch."""


def _assert_public(url: str) -> None:
    """
    Refuse to fetch internal addresses.

    The user supplies this URL and we fetch it from our own network, which is a
    textbook SSRF surface. Resolve the host first and reject anything that is
    not a public unicast address.
    """
    parsed = urlparse(url)

    if parsed.scheme in _BLOCKED_SCHEMES or parsed.scheme not in {"http", "https"}:
        raise UnsafeUrl("Only http and https URLs can be analysed")

    host = parsed.hostname
    if not host:
        raise UnsafeUrl("URL has no host")

    try:
        infos = socket.getaddrinfo(host, None)
    except socket.gaierror as exc:
        raise UnsafeUrl("That domain could not be resolved") from exc

    for info in infos:
        address = ipaddress.ip_address(info[4][0])
        if (
            address.is_private
            or address.is_loopback
            or address.is_link_local
            or address.is_reserved
            or address.is_multicast
            or address.is_unspecified
        ):
            raise UnsafeUrl("That address is not publicly routable")


async def fetch_readable(url: str) -> tuple[str, str | None]:
    """Return (visible text, page title). Raises UnsafeUrl or httpx errors."""
    _assert_public(url)

    async with httpx.AsyncClient(
        follow_redirects=True,
        timeout=settings.scrape_timeout_seconds,
        headers={"user-agent": USER_AGENT},
        max_redirects=5,
    ) as client:
        response = await client.get(url)
        response.raise_for_status()

        content_type = response.headers.get("content-type", "")
        if "html" not in content_type and "text" not in content_type:
            raise ValueError(f"Expected an HTML page, got {content_type or 'unknown content'}")

        html = response.text[:800_000]

    soup = BeautifulSoup(html, "html.parser")

    for tag in soup(["script", "style", "noscript", "svg", "iframe", "form"]):
        tag.decompose()

    title = soup.title.string.strip() if soup.title and soup.title.string else None

    # Meta description is often the single best one-line summary on the page.
    meta = soup.find("meta", attrs={"name": "description"}) or soup.find(
        "meta", attrs={"property": "og:description"}
    )
    meta_text = meta.get("content", "").strip() if meta else ""

    body_text = " ".join(soup.get_text(separator=" ", strip=True).split())
    combined = f"{meta_text}\n\n{body_text}" if meta_text else body_text

    return combined[: settings.scrape_max_chars], title
