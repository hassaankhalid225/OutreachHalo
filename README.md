# OutreachHalo

An AI sales agent SaaS — marketing site plus a full multi-tenant dashboard.
Built from `PRD.md` and `MASTER_PROMPT.md`, modelled on the information
architecture and UX of [prospecthalo.com](https://www.prospecthalo.com).
See [`ANALYSIS.md`](./ANALYSIS.md) for the reference-site breakdown.

```
web/        Next.js 15 (App Router, TS) — marketing site + authenticated app
api/        FastAPI — org-scoped REST API, the only place Anthropic is called
supabase/   Postgres schema, RLS policies, seed function, auth trigger
```

---

## Run it in 30 seconds

```bash
cd web
npm install
npm run dev
```

Open <http://localhost:3000>. **No environment variables, no database, no API
keys.** With nothing configured the app runs in **demo mode**: sign in with any
email and password and you land on a fully populated workspace — 25 scored
prospects, 3 sequences, a 10-thread inbox, a content calendar and live billing
usage, all mutable. It is the same UI and the same code paths as production; only
the storage layer differs.

The AI features still work in demo mode via a built-in deterministic composer,
and the UI says so explicitly rather than passing a template off as a model call.

---

## Run it for real

### 1 · Database

**Supabase (recommended)** — create a project, then run both migrations in the
SQL editor, in order:

```
supabase/migrations/0001_init.sql          schema, indexes, RLS on every tenant table
supabase/migrations/0002_seed_and_bootstrap.sql   seed function + auth.users trigger
```

Or with the Supabase CLI: `supabase db push`.

**Local Postgres** — `docker compose up -d db` applies both migrations on first
boot (port `54322`), then:

```bash
psql postgresql://outreachhalo:outreachhalo@localhost:54322/outreachhalo -f supabase/seed.sql
```

### 2 · Backend

```bash
cd api
python -m venv .venv && .venv/Scripts/activate     # Windows
# python3 -m venv .venv && source .venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # every variable is documented inline, with where to find it
uvicorn app.main:app --reload --port 8000
```

`GET /health` reports which integrations are configured. Interactive docs at
`/docs` outside production.

### 3 · Frontend

```bash
cd web
cp .env.example .env.local   # 4 variables, all optional — see the file's comments
npm run dev
```

Setting both Supabase variables switches auth from the demo cookie to real
Supabase Auth. Setting `API_BASE_URL` switches every read and write from the
in-memory store to the FastAPI backend.

---

## How the pieces fit

```
Browser
  │  Supabase Auth session cookie (middleware refreshes it on every navigation)
  ▼
Next.js  ── server components read through lib/data/repo.ts ──┐
  │      ── server actions write through the same module ─────┤
  │                                                            ▼
  │                                              FastAPI  /api/*
  │                                                 │  verifies the Supabase JWT (HS256)
  │                                                 │  derives org_id from `profiles`
  │                                                 ▼
  └──────────────────────────────────────►   Postgres (RLS per org_id)
                                                   │
                                                   └─► Anthropic  (api/app/services/ai.py)
                                                   └─► Stripe     (test mode)
```

**Tenancy is enforced twice.** Every tenant table has row-level security keyed on
the caller's `profiles.org_id`, *and* every API query filters on the `org_id`
derived from the verified token. A client-supplied org id is never trusted.

**AI lives in exactly one module.** `api/app/services/ai.py` owns the Anthropic
client. The frontend reaches it only through the backend, so the API key never
enters the Next.js process, let alone the browser.

**One set of components, two surfaces.** The five product mockups in
`web/components/mockups/` are the marketing site's visual identity *and* the
dashboard's building blocks. Change the product and the marketing site follows.

**Theming is one block of tokens.** `web/app/globals.css` defines the light
palette on `:root` and a tuned dark counterpart on `.dark`; `darkMode: 'class'`
is already wired, so adding `class="dark"` to `<html>` flips the entire product.
Light is the default and the one the UI was designed and contrast-checked
against — every semantic colour clears WCAG AA, including the intent chips at
their 12% tint.

---

## What is genuinely built

| Area | Status |
|---|---|
| Marketing site — 40+ routes, all prerendered | ✅ |
| Live countdown, marquee, scroll-animated bar chart, auto-advancing tabs | ✅ |
| 5 free tools calling Claude for real (rate limited, no signup) | ✅ |
| SEO: per-route metadata, OG, canonicals, JSON-LD, dynamic sitemap + robots | ✅ |
| Supabase Auth (email/password + Google OAuth) + protected `/app/*` | ✅ |
| 4-step onboarding — real website scraping → Claude extraction, fully skippable | ✅ |
| Dashboard: aggregates, 14-day chart, activity feed | ✅ |
| Prospects: server-side filtering, pagination, detail drawer, feedback re-scoring | ✅ |
| Sequence builder: steps, merge tags, live preview, approval modes, funnel | ✅ |
| Inbox: two-pane, intent tags, AI reply drafting, autopilot, booking link | ✅ |
| Content: month calendar + list, voice-matched generation, scheduling | ✅ |
| Agents, integrations, settings, billing, team — all wired, all plan-gated | ✅ |
| Stripe Checkout, portal, cancel-at-period-end, signed webhooks | ✅ test mode |

### Deliberately not built (Phase 2)

These need third-party contracts and compliance review, not more code. The data
model and API contracts already accommodate them, so nothing in the UI changes
when they land.

- **Real LinkedIn automation.** No public API exists for prospect search or DM
  sending, and automated access violates LinkedIn's User Agreement. A compliant
  path needs Partner Program access or an explicitly consented session model
  with legal sign-off. `connected_accounts.status` already carries
  `mock_connected → connected`.
- **Real Gmail / Outlook OAuth sending.** Needs Google and Microsoft app
  verification. Send paths already write through `messages` + `automation_log`.
- **The 25+ provider email enrichment waterfall.** Paid vendor contracts.
- **A published MCP server package.** The tool contracts are documented at
  `/mcp-server`; the REST API behind them is live.

Every stub carries a `// TODO: requires <X>` comment at the point of use.

---

## Verify

```bash
cd web && npx tsc --noEmit && npm run build   # clean typecheck, 40+ routes prerendered
cd api && python -c "from app.main import app; print(len(app.routes))"
```

## Deploy

| Service | Target | Notes |
|---|---|---|
| `web/` | Vercel | Set all `NEXT_PUBLIC_*` plus `API_BASE_URL`. Root directory `web`. |
| `api/` | Railway / Render / Fly | Dockerfile included; non-root, healthchecked. |
| Database | Supabase | Run both migrations. RLS is on by default. |

Point the Stripe webhook at `POST /api/billing/webhook` and set
`STRIPE_WEBHOOK_SECRET` — the handler rejects unsigned payloads.

---

## A note on the brief

This is built as an original product named **OutreachHalo**, using the reference
site's information architecture, section structure and interaction patterns.
Copy is rewritten rather than copied, testimonials and the founder story are
clearly fictional placeholders, and no ProspectHalo branding, logo or real-person
likeness is reproduced. Structure and UX patterns are not protectable; verbatim
marketing copy and brand assets are.
