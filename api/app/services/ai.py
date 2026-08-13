"""
The single place this application talks to a language model.

Every AI feature in the product — website analysis, reply drafting, post
generation and the public free tools — funnels through here, so API keys exist
in exactly one module and never reach the frontend.

Two providers are supported behind one `complete()` call: Anthropic and Gemini.
Only the transport differs; the prompts below are shared, so switching provider
is an environment change (`AI_PROVIDER`) and never a code change.

Notes on the request shape:
  * These are short, latency-sensitive, well-specified calls (extract three
    fields; write one email). Extended reasoning is deliberately disabled on
    both providers — the user is waiting, and the tasks do not benefit from it.
  * `temperature` / `top_p` are intentionally absent on the Anthropic path:
    current Claude models reject those sampling parameters.
"""

from __future__ import annotations

import json
import logging
import re

import anthropic
from anthropic import AsyncAnthropic

from app.config import settings

logger = logging.getLogger(__name__)

_anthropic_client: AsyncAnthropic | None = None
_gemini_client = None


class AIUnavailable(RuntimeError):
    """Raised when no provider is configured, so callers can degrade gracefully."""


# ---------------------------------------------------------------------------
# Providers
# ---------------------------------------------------------------------------


async def _complete_anthropic(system: str, user: str, max_tokens: int) -> str:
    global _anthropic_client
    if _anthropic_client is None:
        _anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    try:
        response = await _anthropic_client.messages.create(
            model=settings.anthropic_model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
    except anthropic.RateLimitError:
        logger.warning("Anthropic rate limit hit")
        raise
    except anthropic.APIStatusError as exc:
        logger.error("Anthropic API error %s: %s", exc.status_code, exc.message)
        raise
    except anthropic.APIConnectionError:
        logger.error("Could not reach the Anthropic API")
        raise

    # A refusal comes back as a successful response with an empty content list.
    if getattr(response, "stop_reason", None) == "refusal":
        raise AIUnavailable("The model declined this request")

    return "".join(block.text for block in response.content if block.type == "text").strip()


async def _complete_gemini(system: str, user: str, max_tokens: int) -> str:
    from google import genai
    from google.genai import types

    global _gemini_client
    if _gemini_client is None:
        _gemini_client = genai.Client(api_key=settings.gemini_api_key)

    config: dict = {
        "system_instruction": system,
        "max_output_tokens": max_tokens,
    }

    # 2.5-series models reason by default and bill that reasoning against
    # max_output_tokens — which on a short budget can consume the whole
    # allowance and return empty text. These tasks do not need it.
    if "2.5" in settings.gemini_model:
        config["thinking_config"] = types.ThinkingConfig(thinking_budget=0)

    response = await _gemini_client.aio.models.generate_content(
        model=settings.gemini_model,
        contents=user,
        config=types.GenerateContentConfig(**config),
    )

    text = (response.text or "").strip()
    if not text:
        # Usually a safety block or an exhausted token budget; both are worth
        # surfacing rather than returning an empty string to the UI.
        reason = getattr(getattr(response, "candidates", [None])[0], "finish_reason", None)
        raise AIUnavailable(f"Gemini returned no text (finish_reason={reason})")

    return text


async def complete(system: str, user: str, *, max_tokens: int | None = None) -> str:
    """One-shot completion against whichever provider is configured."""
    provider = settings.active_ai_provider

    if provider is None:
        raise AIUnavailable(
            "No AI provider configured. Set ANTHROPIC_API_KEY or GEMINI_API_KEY."
        )

    budget = max_tokens or settings.anthropic_max_tokens

    if provider == "anthropic":
        return await _complete_anthropic(system, user, budget)
    if provider == "gemini":
        return await _complete_gemini(system, user, budget)

    raise AIUnavailable(f"Unknown AI provider: {provider}")


def _extract_json(raw: str) -> dict[str, Any] | None:
    """
    Pull a JSON object out of a model response.

    We ask for bare JSON, but tolerate a fenced block or a leading sentence
    rather than failing the user's onboarding over formatting.
    """
    candidate = raw.strip()

    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", candidate, re.DOTALL)
    if fenced:
        candidate = fenced.group(1)
    else:
        braces = re.search(r"\{.*\}", candidate, re.DOTALL)
        if braces:
            candidate = braces.group(0)

    try:
        parsed = json.loads(candidate)
    except json.JSONDecodeError:
        logger.warning("Model returned unparseable JSON: %s", raw[:200])
        return None

    return parsed if isinstance(parsed, dict) else None


# ---------------------------------------------------------------------------
# Website analysis
# ---------------------------------------------------------------------------

ANALYZE_SYSTEM = """You analyse a company's website copy and extract three facts a \
sales agent needs before it can write on the company's behalf.

Return ONLY a JSON object with exactly these keys, no prose, no code fence:
{
  "what_you_sell": "one sentence, concrete, in the company's own vocabulary",
  "who_you_target": "one sentence naming the buyer's role, company size and industry",
  "how_to_pitch": "one sentence naming the specific problem they remove, phrased as an angle a seller could open with"
}

Rules:
- Be specific. "Software for businesses" is a failure; name the actual category.
- Use the company's own words where they are clear; do not invent claims.
- If the page is thin or unreadable, say so plainly in the field rather than guessing.
- Each value must be under 220 characters."""


async def analyze_website(url: str, page_text: str, title: str | None) -> dict[str, str]:
    prompt = (
        f"Website: {url}\n"
        f"Page title: {title or 'unknown'}\n\n"
        f"Visible page text:\n\"\"\"\n{page_text[: settings.scrape_max_chars]}\n\"\"\""
    )

    raw = await complete(ANALYZE_SYSTEM, prompt, max_tokens=800)
    parsed = _extract_json(raw)

    if not parsed:
        raise ValueError("Could not parse the analysis response")

    return {
        "what_you_sell": str(parsed.get("what_you_sell", ""))[:400],
        "who_you_target": str(parsed.get("who_you_target", ""))[:400],
        "how_to_pitch": str(parsed.get("how_to_pitch", ""))[:400],
    }


# ---------------------------------------------------------------------------
# Reply drafting
# ---------------------------------------------------------------------------

REPLY_SYSTEM = """You draft the next outbound message in a live B2B sales conversation, \
writing as the seller.

Hard rules:
- Match the length and register of the thread. Usually 40-90 words.
- Reference something concrete from their reply or their listed buying signals.
- Exactly one ask, answerable in a single line.
- No greetings beyond the first name, no "I hope this finds you well", no emoji,
  no bullet lists, no subject line.
- If the prospect said no or "not now", acknowledge it, name a specific time to
  return, and stop. Do not push.
- If a booking link is supplied and they are ready, include it verbatim.

Return only the message body."""


async def draft_reply(
    prospect_name: str,
    prospect_title: str | None,
    company: str | None,
    signals: list[str],
    intent_tag: str,
    history: list[dict[str, str]],
    booking_url: str | None,
) -> str:
    transcript = "\n".join(
        f"{'SELLER' if message.get('direction') == 'outbound' else 'PROSPECT'}: {message.get('body', '')}"
        for message in history[-10:]
    )

    prompt = f"""Prospect: {prospect_name}{f', {prospect_title}' if prospect_title else ''}\
{f' at {company}' if company else ''}
Intent classification: {intent_tag}
Buying signals on file: {', '.join(signals) if signals else 'none recorded'}
Booking link: {booking_url or 'none — ask them to propose times instead'}

Conversation so far:
{transcript}

Write the seller's next message."""

    return await complete(REPLY_SYSTEM, prompt, max_tokens=700)


# ---------------------------------------------------------------------------
# LinkedIn content
# ---------------------------------------------------------------------------

POST_SYSTEM = """You write LinkedIn posts for a B2B founder, matching a supplied \
writing sample so closely that their audience would not notice a difference.

Match from the sample: sentence length and rhythm, paragraph breaks, vocabulary,
how they open, whether they use lists, and how blunt they are.

Rules:
- One idea per post. Open with the claim, not the setup.
- Specific numbers beat adjectives. Never invent a statistic — if you need one,
  frame it as the reader's own experience instead.
- No hashtags, no emoji, no "thoughts?" sign-off unless the sample uses one.
- 80-220 words.

Return only the post text."""


async def generate_post(
    brief: str,
    voice_sample: str | None,
    what_you_sell: str | None,
    audience: str | None,
) -> str:
    prompt = f"""Topic: {brief}
Their business: {what_you_sell or 'not specified'}
Who should read it: {audience or 'B2B founders and revenue leaders'}

Writing sample to match:
\"\"\"
{voice_sample or '(no sample provided — use a plain, direct, unadorned register)'}
\"\"\"

Write the post."""

    return await complete(POST_SYSTEM, prompt, max_tokens=900)


# ---------------------------------------------------------------------------
# Public free tools
# ---------------------------------------------------------------------------

TOOL_SYSTEMS: dict[str, str] = {
    "cold_email": """You write cold outbound emails that get replies.
Return a subject line on the first line prefixed with "Subject: ", a blank line, then the body.
Under 90 words. Open on something that changed for the recipient. One ask. No pleasantries, no emoji.""",
    "linkedin_post": POST_SYSTEM,
    "icp": """You turn a business description into a structured ideal customer profile.
Return plain text with these labelled sections: Job titles, Company size, Industries, Geographies,
Buying signals to watch (4 bullets), Disqualifiers (3 bullets).
Be exclusionary — a good ICP rules more out than in.""",
    "linkedin_message": """You write LinkedIn connection notes and first DMs.
Under 300 characters so LinkedIn does not truncate it. Reference something specific and true.
Do not pitch — earn the accept, then ask one question they can answer in a line. No emoji.""",
    "email_sequence": """You write four-touch outbound email sequences built around a single angle.
Return each touch as: "DAY {n} · Email", then "Subject: ...", then the body.
Days 0, 2, 4, 7. Each touch adds one new piece of information rather than repeating the last.
The final touch gives a clean way to say no. Bodies under 80 words. Use {{first_name}} and {{company}} merge tags.""",
}


async def run_tool(kind: str, payload: dict[str, str]) -> str:
    system = TOOL_SYSTEMS.get(kind)
    if not system:
        raise ValueError(f"Unknown tool: {kind}")

    lines = [f"{key.replace('_', ' ').title()}: {value}" for key, value in payload.items() if value]
    return await complete(system, "\n".join(lines) or "No input supplied.", max_tokens=1200)
