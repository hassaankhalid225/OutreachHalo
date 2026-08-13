# Product Requirements Document (PRD)
## Project: "OutreachHalo" — ProspectHalo-style AI Sales Agent Platform (Clone/Rebuild)

**Prepared for:** Hassaan Khalid
**Reference site analyzed:** https://www.prospecthalo.com
**Document type:** Full PRD (UI/UX + Logic/Backend) for Claude Code implementation
**Stack:** Next.js 14 (App Router) + Tailwind + shadcn/ui (frontend) · FastAPI (backend) · Supabase (Postgres + Auth + Storage, multi-tenant RLS) · Stripe (billing)

---

## 1. Scope Definition (Read This First)

This PRD covers **two phases**:

- **Phase 1 (Build Now — Production Ready):** The full public marketing website (pixel-close clone of prospecthalo.com: hero, problem, solution, how-it-works, integrations, pricing, founder note, FAQ, footer, all sub-pages) PLUS a fully functional authenticated dashboard/app shell (prospects, sequences, unified inbox, content calendar, settings, billing) running on real Supabase data with realistic seed/mock data and working CRUD, filters, and state.
- **Phase 2 (Documented, Not Built Yet):** Real LinkedIn automation, real email sending (OAuth to Gmail/Outlook), real AI lead scoring/enrichment (25+ data providers), MCP server. These require third-party API contracts, compliance review (LinkedIn automation violates LinkedIn's ToS and needs an anti-detection/session-based approach or an official partner API), and paid enrichment vendors. This PRD documents the **data model and API contracts** so Phase 2 can be plugged in later without refactoring the UI.

**Why this split:** A single AI coding pass cannot legally/technically stand up real LinkedIn scraping + verified email sending + a live enrichment pipeline. Building the full UI + realistic mock backend now means the product is demo-able, sellable, and structurally ready for real integrations later.

---

## 2. Product Summary

OutreachHalo is an AI Sales Agent SaaS. A user connects their business (via website URL analysis), defines their Ideal Customer Profile (ICP), and the platform:
1. Discovers prospects matching that ICP.
2. Scores them using intent signals.
3. Runs multi-step, multi-channel (LinkedIn + Email) outreach sequences from the user's own connected accounts.
4. Generates and schedules LinkedIn content in the user's voice to drive inbound leads.
5. Aggregates all replies into one inbox, auto-classifies intent, and can autopilot the conversation toward booking a meeting.

**Target users:** Founders, small agencies, solo sales teams (per site: "founders, agencies and sales teams").

---

## 3. Personas

| Persona | Goal | Pain point solved |
|---|---|---|
| Solo Founder | Fill pipeline without hiring an SDR | No time for manual prospecting |
| Agency Owner (e.g., marketing/dev agency) | Land more clients from LinkedIn | Manual outreach doesn't scale |
| Small Sales Team Lead | Give reps a force-multiplier tool | Reps spend hours on list-building, not selling |

---

## 4. Information Architecture / Sitemap

```
/                          Landing page (main marketing page)
/features                  Features index
/features/ai-prospecting
/features/linkedin-outreach-automation
/features/cold-email-automation
/features/automated-follow-ups
/features/unified-reply-inbox
/features/autopilot-closing
/features/linkedin-content-generation
/integrations
/mcp-server
/for-agents
/solutions
/solutions/for-founders
/solutions/for-agencies
/solutions/for-sales-teams
/solutions/for-startups
/use-cases
/use-cases/linkedin-lead-generation
/use-cases/cold-email-automation
/use-cases/win-more-customers
/use-cases/inbound-lead-generation
/use-cases/replace-an-sdr
/industries
/compare                   Comparison hub
/compare/[competitor]      e.g. prospecthalo-vs-artisan
/alternatives
/alternatives/[competitor]
/best/[listicle-slug]
/tools                     Free tools index
/tools/ai-cold-email-generator
/tools/ai-linkedin-post-generator
/tools/ai-icp-generator
/tools/ai-linkedin-message-generator
/tools/ai-email-sequence-generator
/pricing
/about
/blog
/blog/[slug]
/privacy  /terms  /refund
/sign-up  /sign-in

--- Authenticated app (dashboard) ---
/app/onboarding            Website analysis + ICP setup wizard
/app/dashboard             Overview / home
/app/prospects             Prospect list + filters + fit scoring
/app/prospects/[id]        Prospect detail (signals, timeline, sequence status)
/app/sequences             List of outreach sequences/campaigns
/app/sequences/[id]        Sequence builder + analytics
/app/inbox                 Unified reply inbox
/app/inbox/[conversationId]
/app/content               LinkedIn content calendar + generator
/app/content/[postId]
/app/agents                AI agent config (active agents, caps, tone)
/app/integrations          Connect LinkedIn/Gmail/Outlook/Google Workspace
/app/settings              Account, ICP, notification, sending limits
/app/billing               Plan, usage, invoices (Stripe)
/app/team                  Shared workspace / seats (Growth+ plan)
```

---

## 5. Marketing Website — Section-by-Section UI Spec

### 5.1 Header / Nav
- Sticky, transparent-to-solid on scroll.
- Logo left. Nav items: Features, Use cases, Solutions, Compare, Free Tools, Pricing, Blog (each with mega-dropdown showing sub-links from sitemap above).
- Right: "Sign in" (ghost button) + "Start for free" (primary CTA button).
- Optional top banner strip above header: "🎉 Limited offer: 34% OFF" + live countdown timer (HH:MM:SS, anchors to `#pricing`). Countdown persists via localStorage per session so it doesn't reset on refresh mid-session (still resets on new day/visit per business rule — implement as: set a target end-timestamp in a cookie on first visit, countdown down from that).

### 5.2 Hero Section
- Small eyebrow label: "AI Sales Agent"
- H1: "Turn LinkedIn into your best salesperson." (large, bold, two-line max)
- Subheading: one sentence describing the 4-part value prop (learns business → finds prospects → runs outreach → creates content)
- Primary CTA button: "Launch my agent for free" → `/sign-up`
- Row of 8 circular avatar images (social proof, overlapping) + caption "Trusted by founders, agencies and sales teams"
- Hero visual: large product screenshot/mockup in a browser-chrome frame, with a soft gradient background blob behind it.

### 5.3 Trust / Integration Strip
- Small horizontal row: "Posts and sends from the accounts you already own" + 4 logos (LinkedIn, Gmail, Outlook, Google Workspace) as pill badges.
- Below: auto-scrolling (marquee) testimonial cards — company logo, quote (2-3 lines), name + title. Loop infinitely (duplicate array, CSS translateX animation, pause on hover).

### 5.4 Problem Section
- Eyebrow: "Problem"
- H2: "You didn't start a company to chase leads all day."
- H3: "Here is where your week actually goes."
- Intro paragraph.
- **Animated horizontal bar-list**: each row = task name + time (right-aligned), bar width proportional to hours, animates in (grows from 0) on scroll-into-view. Rows: Finding right people (5h), Checking fit (6h), Writing messages (5h), Writing posts (4h), Chasing follow-ups (4h), Wondering why likes don't convert (2h), Staying consistent (∞).
- Total callout: "Every single week = 25+ hrs" as a large bold stat.
- Closing line: "That's not growth. That's manual sales work."

### 5.5 Solution Section (5 feature showcases)
Repeating pattern per feature: eyebrow label (small) → H3 → 1-2 sentence description → embedded interactive-looking UI mockup card (NOT a real screenshot — build as actual HTML/CSS components so they look "alive").

1. **AI Prospecting** — "Never run out of people to sell to." Mockup: card list "Found 3 prospects on LinkedIn — just now" with avatar + name + title rows fading in sequentially.
2. **Intent Signals** — "Reach them while they are ready to buy." Mockup: circular/badge score "92/100 HOT" + "Why now" tag chips (Hiring SDRs, Engaged a competitor, Posted about outbound, Changed roles 12 days ago) + a mini quoted post snippet with "View post" link.
3. **LinkedIn Content (Inbound)** — "Get buyers coming to you." Mockup: a LinkedIn-post-style card (avatar, 2-line post text, reaction avatars, "9 reactions", "3 buying signals created").
4. **Multichannel Outreach** — "Every message written and sent for you." Mockup: vertical 4-step timeline (LinkedIn Day 0 → Gmail Day 2 → LinkedIn Day 4 → Gmail Day 7), each step = channel icon + day label + message preview text in a chat-bubble style. Caption: "Sent from your accounts — paced safely."
5. **Unified Inbox** — "Replies answered. Meetings booked." Mockup: inbox-style list, 3 rows, each with avatar, name, status tag (Interested / Question / Not now — color-coded chip), and message preview.

### 5.6 "How It Works" — 4-Step Tabbed Section
- Eyebrow: "How it works" → H2: "Four steps. Then it runs itself."
- Horizontal stepper/tab control (1 Setup, 2 Outbound, 3 Inbound, 4 You close the deals) — clicking a tab swaps the right-side visual panel (or auto-advances every ~4s with a progress bar per tab, pausable on interaction).
- Each step: number badge, title, 1-2 sentence description, and its own mini mockup panel (reuse mockup components from 5.5 where relevant — e.g. step 1 shows a "Business understood ✓ Ready" card with extracted "What you sell / Who you target / How to pitch you" fields).

### 5.7 Integrations Section
- H2: "Connect [ProductName] to your favorite AI agents."
- Sentence with inline logo chips (Claude, ChatGPT, Cursor, or any other AI agent).
- Two links: "Set up in 2 minutes" (→ /mcp-server) and "Read the agent guide" (→ /for-agents).
- Logo grid row: OpenAI, Gemini, Perplexity, Cursor, OpenClaw, Hermes, Claude, ChatGPT (grayscale, colorize on hover).

### 5.8 Pricing Section
- H2: "Pick the plan that grows with you."
- Sub-line comparing to human SDR cost ("$5,000/month vs starts at $59").
- 3 cards side-by-side, middle one ("Growth") visually elevated (border highlight + "Best value" ribbon badge).
- Each card: plan name, strikethrough original price + discounted price/mo, 1-sentence description, "Start free trial" button, feature checklist (checkmark icon + text), Custom tier has "Get a demo" instead of trial button and links to an external calendar booking URL.
- Small print below cards: 7-day free trial / cancel terms.

### 5.9 Founder Story Section
- Founder photo (circular) + name + role.
- Pull-quote style headline in quotes.
- 3-paragraph narrative story (first-person).
- Email link at the bottom.

### 5.10 FAQ Section
- H2: "Honest answers."
- Accordion list (single-open or multi-open), 9 items, chevron rotates on expand, smooth height animation.

### 5.11 Final CTA Band
- Full-width band, contrasting background.
- H2: "Your next 10 customers are already out there."
- Sub-line + CTA button.

### 5.12 Footer
- Logo + tagline + social icons (X, LinkedIn).
- 6 columns of link groups (Product, Solutions, Compare, Alternatives, Tools & guides, Company, Legal) — mirrors sitemap.
- Legal disclaimer paragraph (trademark/affiliation disclaimer, GDPR/CAN-SPAM notice).
- Copyright line with dynamic year.

---

## 6. Authenticated Dashboard — UI/UX + Logic Spec

### 6.1 Onboarding Wizard (`/app/onboarding`)
**Step 1 — Enter website URL.**
- Input field + "Analyze" button.
- Backend: `POST /api/onboarding/analyze-website` — server fetches the URL, extracts title/meta/visible text (basic scrape, or OG tags), sends to an LLM (Claude via Anthropic API) with a prompt: "Given this website content, extract: (a) what they sell in one sentence, (b) who they likely target (ICP one-liner), (c) a one-line pitch angle." Returns structured JSON `{ what_you_sell, who_you_target, how_to_pitch }`.
- UI shows a "Business understood ✓ Ready" card populating those 3 fields live (typewriter/fade-in effect), editable by user before continuing.

**Step 2 — Define ICP.**
- Form: target job titles (multi-tag input), company size range (dropdown), industries (multi-select), geography (multi-select), optional keywords.
- Saves to `icp_profiles` table.

**Step 3 — Connect accounts.**
- Cards for LinkedIn, Gmail, Outlook, Google Workspace — "Connect" buttons (OAuth stubs in Phase 1: store a `connected_accounts` row with status `mock_connected`; real OAuth wired in Phase 2).
- Daily sending cap slider (per account safety).

**Step 4 — Launch agent.**
- Summary review screen → "Launch my agent" button → creates an `agents` row with status `active`, redirects to `/app/dashboard`.

### 6.2 Dashboard Home (`/app/dashboard`)
- Top stat cards: Prospects found (this month), Messages sent, Reply rate %, Meetings booked.
- "Your agent — Active" status card (green dot pulse animation) with today's activity feed (e.g. "Found 3 prospects", "Sent 5 messages", "1 reply needs attention").
- Mini chart: outreach activity over last 14 days (line/bar chart — use `recharts`).
- Quick links to Inbox (with unread badge count) and Prospects.

### 6.3 Prospects (`/app/prospects`)
- Table/card-list toggle view.
- Columns: Avatar, Name, Title, Company, Fit Score (badge: colored 0-100), Intent (HOT/WARM/COLD chip), Signals (icon chips, hover tooltip lists all matched signals), Sequence Status (Not started / In sequence / Replied), Last activity date.
- Filters: fit score range, intent level, signal type, sequence status, source (LinkedIn/Content-engagement).
- Row click → `/app/prospects/[id]` detail drawer/page: full signal breakdown ("Why now" list), activity timeline, message history, manual "Add to sequence" button, thumbs up/down "mark good/bad fit" (feeds `feedback` table used to note scoring improvements — Phase 2 wires real re-ranking).
- Backend: `prospects` table with FK to `icp_profiles`, `signals` (jsonb array), `fit_score` (int), `intent_level` (enum).

### 6.4 Sequences (`/app/sequences`)
- List of campaigns: name, status (draft/active/paused), # prospects enrolled, reply rate, created date.
- Sequence builder (`/app/sequences/[id]`): visual step editor — add steps (LinkedIn connect / LinkedIn message / Email), each step has: channel icon, delay ("Day 0", "+2 days"), message template with `{{first_name}}`, `{{company}}`, `{{signal}}` merge tags, and an "AI-personalize per prospect" toggle.
- Approval mode setting per sequence: `Approve first message` / `Approve every message` / `Full autopilot` (radio group — mirrors "You choose the leash" from source site).
- Analytics tab: funnel chart (Sent → Opened/Viewed → Replied → Meeting booked).

### 6.5 Unified Inbox (`/app/inbox`)
- Two-pane layout: left = conversation list (avatar, name, last message snippet, intent tag chip: Interested/Question/Not now/Neutral, unread bold), right = active conversation thread (chat-bubble UI, channel icon per message showing LinkedIn or Email origin).
- AI-suggested reply box at bottom (editable before send) — Phase 1: canned/templated suggestion via same LLM call pattern as onboarding; Phase 2: full autopilot send.
- "Autopilot" toggle per conversation — when ON, agent can auto-send the suggested reply without human approval (logged in an `automation_log` table either way).
- Booking-link auto-share: when intent = "Interested" and message contains scheduling language, show a suggested action "Share booking link" button (opens Cal.com/Calendly link stored in user settings).

### 6.6 Content / LinkedIn Post Generator (`/app/content`)
- Calendar view (month grid) of scheduled posts + list view toggle.
- "Generate post" flow: paste a sample post (for voice-matching) once (stored in `voice_samples`), then generate button calls LLM with a style-matching prompt + ICP context → returns draft post text + optional AI image suggestion.
- Draft editor: text area, character count, image upload/attach, schedule date/time picker, "Post now" / "Schedule" buttons.
- Each published post row shows engagement stats (reactions, comments) and "X became leads" count (links matched prospects who engaged, per the "3 buying signals created" mechanic on the reference site).

### 6.7 Agents (`/app/agents`)
- List of active AI agents (plan-gated: Pro = 2, Growth = 4).
- Each agent card: name/label, channels active, daily cap, status toggle (active/paused), tone/persona setting.

### 6.8 Integrations (`/app/integrations`)
- Connection cards per provider with status (Connected/Not connected), "Disconnect" (one-click, per FAQ promise), last-sync timestamp.

### 6.9 Settings (`/app/settings`)
- Account/profile, ICP editor (same schema as onboarding step 2), notification preferences, sending-hours/timezone, danger zone (delete account).

### 6.10 Billing (`/app/billing`)
- Current plan card, usage bars (prospects used/limit, posts used/limit, senders used/limit) that reset on the user's own billing-cycle date (not calendar month 1st — mirrors FAQ answer).
- "Upgrade" flow → Stripe Checkout. Invoice history table. Cancel button (2-click confirm, no retention dark patterns, per FAQ).

### 6.11 Team (`/app/team`) — Growth/Custom plans only
- Invite member (email), role (Admin/Member), pending invites list, shared workspace note.

---

## 7. Data Model (Supabase / Postgres, multi-tenant with RLS)

```sql
-- Organizations (tenant boundary)
organizations (id, name, owner_user_id, plan, created_at)

-- Users (Supabase auth.users extended via profile table)
profiles (id references auth.users, org_id, full_name, avatar_url, role, created_at)

-- ICP
icp_profiles (id, org_id, job_titles text[], company_size_min, company_size_max,
              industries text[], geographies text[], keywords text[], created_at)

-- Website analysis result
business_profile (id, org_id, website_url, what_you_sell, who_you_target,
                   how_to_pitch, raw_scrape jsonb, created_at)

-- Connected accounts (LinkedIn/Gmail/Outlook/Google Workspace)
connected_accounts (id, org_id, provider enum, status enum('mock_connected','connected',
                     'disconnected','error'), daily_cap int, oauth_meta jsonb, connected_at)

-- Agents
agents (id, org_id, name, status enum('active','paused'), channels text[],
        approval_mode enum('approve_first','approve_all','autopilot'), created_at)

-- Prospects
prospects (id, org_id, full_name, title, company, avatar_url, linkedin_url,
           fit_score int, intent_level enum('hot','warm','cold'),
           signals jsonb, source enum('linkedin_search','content_engagement'),
           sequence_status enum('not_started','in_sequence','replied','closed'),
           created_at)

-- Feedback (good/bad fit marking → future re-ranking input)
prospect_feedback (id, prospect_id, org_id, is_good_fit boolean, created_at)

-- Sequences / Campaigns
sequences (id, org_id, name, status enum('draft','active','paused'),
           approval_mode enum, created_at)
sequence_steps (id, sequence_id, step_order int, channel enum('linkedin','email'),
                delay_days int, message_template text, ai_personalize boolean)
sequence_enrollments (id, sequence_id, prospect_id, current_step int,
                      status enum('active','completed','stopped'), enrolled_at)

-- Messages (sent + received)
messages (id, org_id, prospect_id, conversation_id, channel enum('linkedin','email'),
          direction enum('outbound','inbound'), body text, sent_at, ai_generated boolean)

-- Conversations (for inbox grouping)
conversations (id, org_id, prospect_id, intent_tag enum('interested','question',
               'not_now','neutral'), autopilot_enabled boolean, last_message_at)

-- Content / Posts
voice_samples (id, org_id, sample_text, created_at)
content_posts (id, org_id, body_text, image_url, status enum('draft','scheduled','posted'),
               scheduled_at, posted_at, reactions_count int, comments_count int,
               leads_generated_count int)

-- Billing (mirrors Stripe)
subscriptions (id, org_id, stripe_customer_id, stripe_subscription_id, plan,
               status, current_period_end)
usage_counters (id, org_id, period_start, period_end, prospects_used, posts_used,
                senders_used)

-- Automation audit log
automation_log (id, org_id, entity_type, entity_id, action, actor enum('ai','human'),
                created_at)
```

**RLS rule pattern (apply to every table with `org_id`):**
```sql
create policy "org_isolation" on <table>
  using (org_id in (select org_id from profiles where id = auth.uid()));
```

---

## 8. Core Backend Logic (FastAPI)

| Endpoint | Purpose |
|---|---|
| `POST /api/onboarding/analyze-website` | Scrape URL + LLM extraction → business_profile |
| `POST /api/icp` | Create/update ICP profile |
| `POST /api/accounts/connect` | Mock-connect an account (Phase 1) / OAuth callback (Phase 2) |
| `GET /api/prospects` | List + filter prospects (paginated, server-side filters) |
| `POST /api/prospects/{id}/feedback` | Good/bad fit marking |
| `POST /api/sequences` / `PUT /api/sequences/{id}` | CRUD sequence + steps |
| `POST /api/sequences/{id}/enroll` | Enroll prospects into a sequence |
| `POST /api/messages/generate` | LLM call to draft a personalized message from prospect signals + template |
| `GET /api/inbox` | List conversations, filterable by intent tag |
| `POST /api/inbox/{conversationId}/reply` | Send (mock in Phase 1) a reply, log to messages |
| `POST /api/content/generate` | LLM call: voice-matched post draft from sample + ICP |
| `POST /api/content/{id}/schedule` | Schedule/publish (mock in Phase 1) |
| `GET /api/billing/usage` | Current usage vs plan limits |
| `POST /api/billing/checkout` | Create Stripe Checkout session |
| `POST /api/billing/webhook` | Stripe webhook handler (subscription state sync) |

**Seed data requirement:** A `seed.py` / SQL seed script must populate each new org with ~20-30 realistic mock prospects, 2-3 sequences, a populated inbox with varied intent tags, and a few scheduled/posted content items — so the dashboard looks alive immediately after signup, exactly like the reference site's UI mockups suggest.

---

## 9. Non-Functional Requirements
- **Responsive:** mobile-first, breakpoints at 640/768/1024/1280.
- **Performance:** Next.js Image optimization for all avatars/logos; lazy-load below-the-fold sections; Lighthouse target 90+.
- **Animations:** scroll-triggered fade/slide-in for sections (use `framer-motion` or CSS `@starting-style` + IntersectionObserver), marquee testimonials, countdown timer, accordion FAQ, tabbed how-it-works with auto-advance.
- **SEO:** per-page metadata (title/description/OG/canonical) matching the pattern seen on the reference site; sitemap.xml + robots.txt generation; semantic heading hierarchy.
- **Auth:** Supabase Auth (email/password + Google OAuth), protected `/app/*` routes via middleware.
- **Accessibility:** proper contrast, keyboard navigation for accordion/tabs, alt text on all images.
- **Security:** RLS on every table, server-side validation on all API routes, rate-limiting on `/api/onboarding/analyze-website` (prevent scrape abuse).

---

## 10. Explicit Out-of-Scope for Phase 1 (documented so Claude Code doesn't over-build or hallucinate)
- Real LinkedIn automation/scraping (no LinkedIn API access — this needs a compliant approach or explicit user consent + session-based automation, high legal/ToS risk).
- Real OAuth to Gmail/Outlook for actual sending.
- Real third-party enrichment providers (25+ data vendors).
- Real MCP server exposing tools to Claude/ChatGPT/Cursor.
- Production Stripe live keys (build with Stripe test mode).

These are Phase 2 and should be proposed as a **separate follow-up project** once the client/business decides to invest in real integrations.
