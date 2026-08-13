# MASTER PROMPT — Paste this into Claude Code

You are building a **production-ready AI Sales Agent SaaS platform** called **"OutreachHalo"**, modeled closely on prospecthalo.com's marketing site design and product UX. Build this as a real, working, deployable application — not a static mockup.

Follow this spec exactly. Work in phases and confirm each phase builds/runs before moving to the next. Do not skip the seed data step — the dashboard must look fully alive with realistic content immediately, with zero manual data entry required to demo it.

---

## 0. Tech Stack (do not deviate)
- **Frontend:** Next.js 14 (App Router, TypeScript), Tailwind CSS, shadcn/ui components, Framer Motion for animations, Recharts for charts, lucide-react for icons.
- **Backend:** FastAPI (Python 3.11+), Pydantic v2, deployed as a separate service.
- **Database/Auth:** Supabase (Postgres + Auth + 
Storage). Use Supabase Row Level Security on every multi-tenant table.
- **Payments:** Stripe (test mode), Checkout + Customer Portal + webhooks.
- **AI:** Anthropic API (Claude) for all "AI generation" features (website analysis, message drafting, post generation) — call via a single shared `lib/ai/client.ts` (frontend server actions) or a FastAPI service wrapper, your choice, but keep it in ONE place so the API key is never duplicated.
- **Deployment target:** Frontend on Vercel, backend on Railway/Render, DB on Supabase. Use environment variables for all secrets — never hardcode.

---

## 1. Project Setup
1. Scaffold a monorepo:
   ```
   /web        -> Next.js app (marketing site + authenticated dashboard)
   /api        -> FastAPI backend
   /supabase   -> SQL migrations + seed scripts
   ```
2. Set up Supabase project schema using the SQL below (create as `/supabase/migrations/0001_init.sql`). Enable RLS on every table with an `org_id` column using this policy pattern:
   ```sql
   create policy "org_isolation_select" on <table>
     for select using (org_id in (select org_id from profiles where id = auth.uid()));
   create policy "org_isolation_all" on <table>
     for all using (org_id in (select org_id from profiles where id = auth.uid()));
   ```

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid not null,
  plan text not null default 'trial',
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id),
  org_id uuid references organizations(id),
  full_name text,
  avatar_url text,
  role text default 'owner',
  created_at timestamptz default now()
);

create table icp_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  job_titles text[],
  company_size_min int,
  company_size_max int,
  industries text[],
  geographies text[],
  keywords text[],
  created_at timestamptz default now()
);

create table business_profile (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  website_url text,
  what_you_sell text,
  who_you_target text,
  how_to_pitch text,
  raw_scrape jsonb,
  created_at timestamptz default now()
);

create table connected_accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  provider text check (provider in ('linkedin','gmail','outlook','google_workspace')),
  status text check (status in ('mock_connected','connected','disconnected','error')) default 'mock_connected',
  daily_cap int default 20,
  oauth_meta jsonb,
  connected_at timestamptz default now()
);

create table agents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  name text,
  status text check (status in ('active','paused')) default 'active',
  channels text[],
  approval_mode text check (approval_mode in ('approve_first','approve_all','autopilot')) default 'approve_first',
  created_at timestamptz default now()
);

create table prospects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  full_name text,
  title text,
  company text,
  avatar_url text,
  linkedin_url text,
  fit_score int,
  intent_level text check (intent_level in ('hot','warm','cold')),
  signals jsonb,
  source text check (source in ('linkedin_search','content_engagement')),
  sequence_status text check (sequence_status in ('not_started','in_sequence','replied','closed')) default 'not_started',
  created_at timestamptz default now()
);

create table prospect_feedback (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id),
  org_id uuid references organizations(id),
  is_good_fit boolean,
  created_at timestamptz default now()
);

create table sequences (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  name text,
  status text check (status in ('draft','active','paused')) default 'draft',
  approval_mode text,
  created_at timestamptz default now()
);

create table sequence_steps (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references sequences(id),
  step_order int,
  channel text check (channel in ('linkedin','email')),
  delay_days int,
  message_template text,
  ai_personalize boolean default true
);

create table sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  sequence_id uuid references sequences(id),
  prospect_id uuid references prospects(id),
  current_step int default 0,
  status text check (status in ('active','completed','stopped')) default 'active',
  enrolled_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  prospect_id uuid references prospects(id),
  intent_tag text check (intent_tag in ('interested','question','not_now','neutral')) default 'neutral',
  autopilot_enabled boolean default false,
  last_message_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  prospect_id uuid references prospects(id),
  conversation_id uuid references conversations(id),
  channel text check (channel in ('linkedin','email')),
  direction text check (direction in ('outbound','inbound')),
  body text,
  sent_at timestamptz default now(),
  ai_generated boolean default false
);

create table voice_samples (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  sample_text text,
  created_at timestamptz default now()
);

create table content_posts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  body_text text,
  image_url text,
  status text check (status in ('draft','scheduled','posted')) default 'draft',
  scheduled_at timestamptz,
  posted_at timestamptz,
  reactions_count int default 0,
  comments_count int default 0,
  leads_generated_count int default 0,
  created_at timestamptz default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text,
  status text,
  current_period_end timestamptz
);

create table usage_counters (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  period_start timestamptz,
  period_end timestamptz,
  prospects_used int default 0,
  posts_used int default 0,
  senders_used int default 0
);

create table automation_log (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  entity_type text,
  entity_id uuid,
  action text,
  actor text check (actor in ('ai','human')),
  created_at timestamptz default now()
);
```

3. Write a seed script `/supabase/seed.ts` (or SQL) that, for a demo org, inserts:
   - 1 business_profile with realistic filled fields
   - 1 icp_profile
   - 4 connected_accounts (all `mock_connected`)
   - 2 agents (active)
   - 25 prospects with varied fit_score (40-98), intent_level, realistic names/titles/companies (use a believable B2B mix — SaaS founders, agency owners, sales directors), and signals jsonb arrays like `["Hiring SDRs", "Engaged a competitor", "Changed roles 12 days ago"]`
   - 3 sequences with 3-4 steps each, and ~15 sequence_enrollments across prospects at various current_step values
   - 8-10 conversations with messages (mix of outbound/inbound, varied intent_tag: interested/question/not_now/neutral) so the inbox looks realistic
   - 6 content_posts: 2 posted (with reactions/comments/leads_generated_count filled in), 2 scheduled, 2 draft
   - 1 subscription row (plan = 'pro', status = 'trialing')
   - usage_counters matching plan limits partially used (e.g. 340/2000 prospects, 12/35 posts)

---

## 2. Build the Marketing Website (`/web/app/(marketing)/`)

Recreate the following pages with the exact section structure, copy tone, and interactive mockup components described below. Use real working animations, not placeholder images — build the mockup cards (prospect lists, intent score badges, sequence timelines, inbox previews, LinkedIn post cards) as actual React components with Tailwind, matching what's described.

**Homepage sections in order:**
1. Announcement bar with live countdown timer (persist end-time in a cookie, format HH:MM:SS, links to `#pricing`)
2. Sticky header with mega-menu nav (Features / Use cases / Solutions / Compare / Free Tools / Pricing / Blog) + Sign in / Start for free buttons
3. Hero: eyebrow "AI Sales Agent", H1 "Turn LinkedIn into your best salesperson.", subheading, primary CTA, 8-avatar social proof row, large product screenshot mockup in browser-chrome frame
4. Integration trust strip (LinkedIn/Gmail/Outlook/Google Workspace logos) + auto-scrolling marquee testimonial cards (build 2+ testimonials, loop seamlessly via duplicated array + CSS animation, pause on hover)
5. Problem section: animated horizontal bar chart of "time lost each week" (7 rows, bars grow-in on scroll via IntersectionObserver + Framer Motion), total stat "25+ hrs", closing line
6. Solution section: 5 feature blocks alternating layout (image-left/text-right, then flipped), each with a custom-built mini UI mockup component:
   - Prospect discovery card list (fade-in rows)
   - Intent score badge (92/100 HOT) + "why now" signal chips + quoted post snippet
   - LinkedIn post preview card with reaction avatars
   - 4-step vertical sequence timeline (LinkedIn/Gmail icons, day labels, chat-bubble previews)
   - Inbox preview list with colored intent chips
7. "How it works" — 4-step tabbed section with auto-advancing progress bar (pause on manual click), each tab swaps a right-side visual panel
8. Integrations section — sentence + inline AI-agent logo chips + logo grid (grayscale→color on hover)
9. Pricing — 3 cards (Pro $59, Growth $100 "Best value" highlighted, Custom "Talk with us"), feature checklists, Stripe Checkout wired for Pro/Growth, external booking link for Custom
10. Founder story section (photo, pull-quote, 3-paragraph narrative, email link)
11. FAQ accordion (write 9 realistic Q&As covering: what it is, does it send messages, does it write posts, autopilot booking, account safety, pricing mechanics, LinkedIn data source, limit overage behavior, cancellation)
12. Final CTA band
13. Mega footer (6 link columns, legal disclaimer paragraph, dynamic copyright year)

Build these as separate route pages too (can be simpler single-hero + content-block templates reusing shared components): `/features`, `/features/[slug]` (7 sub-features), `/integrations`, `/mcp-server`, `/for-agents`, `/solutions`, `/solutions/[slug]` (4), `/use-cases`, `/use-cases/[slug]` (5), `/industries`, `/compare`, `/compare/[slug]`, `/alternatives`, `/alternatives/[slug]`, `/tools`, `/tools/[slug]` (build these as REAL working free tools — e.g. the AI cold email generator should actually call the Claude API and generate a real email from user input, since these are lead-gen tools on the real site), `/pricing`, `/about`, `/blog`, `/blog/[slug]`, `/privacy`, `/terms`, `/refund`.

Add proper per-page metadata (title, description, OG tags, canonical URL) for every route. Generate `sitemap.xml` and `robots.txt` dynamically from the route list.

---

## 3. Build Auth + Onboarding

1. Supabase Auth: email/password + Google OAuth sign-up/sign-in pages at `/sign-up`, `/sign-in`.
2. On first sign-up, create an `organizations` row and `profiles` row for the user (via a Postgres trigger on `auth.users` insert, or a server action right after signup).
3. Build `/app/onboarding` as a 4-step wizard (use shadcn `Stepper`-style pattern or a simple state-driven multi-step form):
   - **Step 1:** Website URL input → "Analyze" button → calls `POST /api/onboarding/analyze-website` (FastAPI) which fetches the URL server-side, strips HTML to readable text, and sends it to Claude with a system prompt instructing it to return strict JSON: `{"what_you_sell": "...", "who_you_target": "...", "how_to_pitch": "..."}`. Show the 3 fields populating with a fade-in/typewriter effect, each editable.
   - **Step 2:** ICP form (job titles as tag input, company size range slider, industries multi-select, geography multi-select, keywords tag input) → saves to `icp_profiles`.
   - **Step 3:** Connect accounts screen — 4 provider cards, "Connect" button sets `connected_accounts.status = 'mock_connected'` immediately (no real OAuth in this phase) with a success checkmark animation. Daily cap slider per account.
   - **Step 4:** Summary + "Launch my agent" button → creates an `agents` row (status active) → redirect to `/app/dashboard` with a celebratory toast.

---

## 4. Build the Authenticated Dashboard (`/web/app/(app)/`)

Protect all `/app/*` routes with Next.js middleware checking Supabase session; redirect unauthenticated users to `/sign-in`.

Build a persistent sidebar layout (logo top, nav items: Dashboard, Prospects, Sequences, Inbox [with unread count badge], Content, Agents, Integrations, Team, Settings, Billing — user avatar + org name at bottom with dropdown for sign out).

Implement each page per the detailed spec below. All data reads/writes go through FastAPI endpoints (see Section 5) which enforce org scoping server-side in addition to RLS.

### `/app/dashboard`
- 4 stat cards (Prospects found this month, Messages sent, Reply rate %, Meetings booked) computed from real seeded data via SQL aggregates.
- "Your agent — Active" card with pulsing green dot + today's activity feed list (pull recent rows from `automation_log`, `messages`, `prospects` ordered by created_at desc, limit 5, humanized as sentences e.g. "Found 3 new prospects", "Sent 5 messages", "1 reply needs your attention").
- 14-day outreach activity line chart (Recharts) — messages sent per day.
- Quick-link cards to Inbox and Prospects with live counts.

### `/app/prospects`
- Server-paginated table (shadcn `Table` or `DataTable`) with columns: avatar+name, title, company, fit score badge (color scale: green 80+, yellow 50-79, gray <50), intent chip (HOT red / WARM orange / COLD blue), signal chips (show first 2 + "+N more" tooltip), sequence status badge, last activity.
- Filter bar: fit score range slider, intent multi-select, signal type multi-select, sequence status dropdown, source dropdown. Filters apply via query params and server-side filtering in the API.
- Row click opens a right-side Sheet/drawer (`/app/prospects/[id]`): full signal list with icons, message history timeline, "Add to sequence" dropdown-select + button, thumbs-up/thumbs-down feedback buttons that POST to `/api/prospects/{id}/feedback`.

### `/app/sequences`
- List view: cards/table of sequences (name, status toggle switch draft/active/paused, enrolled count, reply rate %, created date), "New sequence" button.
- Builder page `/app/sequences/[id]`: visual vertical step list — each step is a card showing channel icon (LinkedIn/Email), delay input ("Day {n}"), a message template textarea supporting `{{first_name}}` `{{company}}` `{{signal}}` merge tags with a live preview panel substituting sample prospect data, and an "AI-personalize per prospect" toggle switch. "Add step" button appends a new step card. Approval-mode radio group at the top (Approve first message / Approve every message / Full autopilot).
- Analytics tab on the same page: simple funnel chart (Sent → Replied → Meeting booked) using Recharts.

### `/app/inbox`
- Two-pane layout. Left pane: conversation list sorted by last_message_at desc, each row shows avatar, name, snippet of last message, intent chip, bold if unread. Search + intent filter dropdown at top.
- Right pane: selected conversation thread, chat-bubble style (outbound bubbles right-aligned, inbound left-aligned), each bubble shows a small channel icon (LinkedIn/Gmail) in the corner.
- Bottom compose box: textarea + "Generate AI reply" button (calls Claude with conversation context + prospect signals to draft a reply, populates the textarea, user can edit before sending) + Send button (inserts a `messages` row, direction outbound).
- Per-conversation "Autopilot" toggle switch at the top of the thread.
- When intent_tag = 'interested', show a highlighted suggestion banner: "Share your booking link?" with a button that inserts the user's booking URL (from settings) as the next message.

### `/app/content`
- Toggle between Calendar view (month grid, posts shown as colored dots/chips on their scheduled date, click to open) and List view (table: date, status badge, snippet, reactions, comments, leads generated).
- "New post" flow: if no `voice_samples` exist yet, prompt user to paste one sample post first (stored once, reused). Then a generation form: brief/topic input → "Generate" button calls Claude with a prompt instructing it to write in the voice of the provided sample, referencing the org's ICP/business_profile → returns draft text, editable in a textarea, with character count. Schedule date/time picker + "Save draft" / "Schedule" / "Post now" buttons.
- Posted items show engagement stats and a "View leads generated" link filtering the Prospects page by `source = content_engagement`.

### `/app/agents`
- Card grid, one card per agent: name (editable inline), status toggle, channels active (icon badges), daily cap display, approval mode badge. "Add agent" button disabled with tooltip if at plan limit (Pro=2, Growth=4).

### `/app/integrations`
- 4 provider cards (LinkedIn, Gmail, Outlook, Google Workspace): logo, status badge, "Connect"/"Disconnect" button, last-synced timestamp. Disconnect requires a confirm dialog but completes in one click after confirm (per the "disconnect in one click" promise).

### `/app/settings`
- Tabs: Profile (name, avatar upload to Supabase Storage), ICP (reuse onboarding step 2 form, editable), Notifications (toggles), Sending hours/timezone picker, Booking link URL field, Danger zone (delete account with confirm-type-to-delete pattern).

### `/app/billing`
- Current plan card with usage bars (prospects/posts/senders — used vs limit, progress bar color shifts to red near 100%), reset date shown as the org's actual billing anchor date (not the 1st).
- "Upgrade plan" opens a plan comparison modal → Stripe Checkout session (test mode).
- Invoice history table (pull from Stripe API via FastAPI endpoint, or mock rows if Stripe isn't connected yet).
- Cancel subscription: 2-click confirm, no retention offer screen, calls Stripe API to cancel at period end.

### `/app/team` (Growth/Custom only — gate with a plan check + upgrade prompt if on Pro)
- Member list table (name, email, role, status), "Invite member" button → email input + role select → inserts a `pending_invites` row (add this table if needed) and (stub) sends an invite email via Supabase.

---

## 5. FastAPI Backend Endpoints

Build these under `/api/routes/`. Every endpoint must extract `org_id` from the authenticated Supabase JWT (verify JWT signature using Supabase's JWT secret) and scope every query by it — never trust a client-supplied org_id.

```
POST   /api/onboarding/analyze-website     body: {url}
POST   /api/icp                            create/update ICP
GET    /api/icp
POST   /api/accounts/connect               body: {provider}
POST   /api/accounts/{id}/disconnect
GET    /api/prospects                      query params: fit_min, fit_max, intent[], signal[], seq_status, source, page, page_size
GET    /api/prospects/{id}
POST   /api/prospects/{id}/feedback        body: {is_good_fit}
POST   /api/prospects/{id}/add-to-sequence body: {sequence_id}
GET    /api/sequences
POST   /api/sequences
PUT    /api/sequences/{id}
POST   /api/sequences/{id}/steps
POST   /api/sequences/{id}/enroll          body: {prospect_ids: []}
GET    /api/inbox                          query: intent_tag, search
GET    /api/inbox/{conversationId}/messages
POST   /api/inbox/{conversationId}/reply   body: {body, ai_generated}
POST   /api/inbox/{conversationId}/generate-reply   -> calls Claude, returns draft text (does not send)
PATCH  /api/inbox/{conversationId}/autopilot        body: {enabled}
GET    /api/content
POST   /api/content/generate               body: {brief}
POST   /api/content/{id}/schedule          body: {scheduled_at}
POST   /api/content/{id}/publish
GET    /api/agents
PATCH  /api/agents/{id}
GET    /api/billing/usage
POST   /api/billing/checkout               body: {plan}
POST   /api/billing/portal
POST   /api/billing/webhook                Stripe webhook, verify signature
GET    /api/dashboard/stats
GET    /api/dashboard/activity
```

All AI-calling endpoints (`analyze-website`, `generate-reply`, `content/generate`) must go through a single shared `services/ai.py` module wrapping the Anthropic API call, with the API key read from environment variable `ANTHROPIC_API_KEY`. Never expose this key to the frontend.

---

## 6. Design System Notes
- Dark, clean SaaS visual style: near-black background (`#0A0A0F` range), off-white text, one accent color (electric blue or violet) for CTAs/highlights, subtle gradient blobs behind hero sections, soft card shadows, generous whitespace, rounded-xl cards.
- Typography: a modern sans (Inter or similar) — large bold headlines (text-5xl/6xl on desktop), tight line-height on H1s.
- All interactive mockup components (prospect cards, score badges, sequence timelines, inbox previews) should look like real, живой mini-app screenshots — not generic stock illustrations. Build them as actual components with real (seeded/sample) data so they double as live previews when reused inside the dashboard.
- Micro-interactions: hover-lift on cards, smooth 200-300ms transitions, skeleton loaders while data fetches (never a blank flash).

---

## 7. Build Order (do in this sequence, verify each runs before continuing)
1. Monorepo scaffold + Supabase migrations + seed script → verify DB has seeded data.
2. Shared UI components (buttons, cards, badges, chips, layout shell) + design tokens (Tailwind config, CSS variables).
3. Marketing homepage fully built and responsive.
4. Remaining marketing sub-pages (features, pricing, FAQ already on home, footer link pages — can be simpler templates).
5. Auth (sign-up/sign-in) + onboarding wizard, wired to real Supabase Auth + the analyze-website AI endpoint.
6. Dashboard shell (sidebar layout) + Dashboard home page with real stats from seeded data.
7. Prospects page (list + detail + filters + feedback).
8. Sequences page (list + builder + enroll).
9. Inbox (list + thread + AI reply generation + send + autopilot toggle).
10. Content (calendar/list + AI generation + scheduling).
11. Agents, Integrations, Settings, Team pages.
12. Billing + Stripe integration (test mode) + usage tracking.
13. Final polish pass: animations, empty states, loading skeletons, error states, mobile responsiveness check on every page, SEO metadata pass, sitemap/robots.

At the end, run a full build (`next build`) and fix all type errors and warnings before declaring done. Confirm the FastAPI server starts cleanly and all endpoints respond. Provide a `.env.example` listing every required environment variable (Supabase URL/anon key/service key, Anthropic API key, Stripe keys, app URL).

Do not stub out features silently — if something in this spec can't be completed (e.g. real Stripe keys aren't provided), leave a clearly marked `// TODO: requires <X>` comment and use mock/test-mode behavior instead, exactly as specified in the "Explicit Out-of-Scope for Phase 1" section of the accompanying PRD.
