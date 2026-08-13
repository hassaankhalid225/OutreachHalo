# Reference Analysis — prospecthalo.com

**Analysed:** 11 Aug 2026 · **Target build:** OutreachHalo (this repo)
**Method:** full-page content extraction of `/` and `/pricing`, cross-referenced against the supplied `PRD.md` sitemap.

---

## 1. What the product actually is

ProspectHalo sells one idea, hard: **"an AI sales agent you hire."** Not a tool, not a database, not a
sequencer — a *replacement for a job function*. Every design decision on the site serves that framing.

The functional loop it claims:

```
website URL  ──►  business understood (what you sell / who you target / how to pitch)
                        │
                        ├─► OUTBOUND: search the user's own LinkedIn → score against ICP (18 intent
                        │             signals) → write per-prospect message → send from the user's
                        │             own LinkedIn + email, human-paced, daily caps
                        │
                        └─► INBOUND:  write LinkedIn posts in the user's voice → anyone who engages
                                      and fits the ICP becomes a scored lead
                        │
                        ▼
             one unified inbox, replies auto-classified by intent →
             Autopilot answers, shares booking link, books the meeting
```

Two structural product bets worth copying:

1. **Bring-your-own-accounts.** "Posts and sends from the accounts you already own." This kills the
   deliverability/burner-domain objection and makes the trust strip (LinkedIn/Gmail/Outlook/Google
   Workspace) a *feature*, not a logo wall.
2. **"You choose the leash."** Approve first message / approve every message / full autopilot. This is
   the single most important UX primitive in the product — it converts the "AI will embarrass me"
   objection into a settings toggle. It appears on the marketing site AND must exist per-sequence and
   per-conversation in the app.

**Positioning anchor:** "A human SDR costs $5,000 a month. Your AI agent starts at $59." Every pricing
decision is measured against that anchor rather than against competitors.

---

## 2. Page architecture (homepage, in order)

| # | Section | Job it does | Interactive requirement |
|---|---|---|---|
| 1 | Announcement bar | Urgency — "🎉 Limited offer: 34% OFF" + live `19h 00m 00s` countdown | Real ticking timer, anchors `#pricing` |
| 2 | Sticky header | Nav + dual CTA (Login ghost / Sign up solid) | Transparent → solid on scroll, mega-menu |
| 3 | Hero | Claim + single CTA | Avatar row (8), browser-chrome product frame, gradient blob |
| 4 | Trust strip | Kill the "burner account" objection | 4 platform pills + infinite marquee testimonials |
| 5 | Problem | Quantify the pain: 25+ hrs/week | Bars grow from 0 on scroll-into-view |
| 6 | Solution ×5 | Prove each capability | 5 hand-built mini-app mockups, alternating sides |
| 7 | How it works | Reduce perceived setup cost: "Four steps. Then it runs itself." | Auto-advancing tabs w/ progress bar, pause on click |
| 8 | Integrations | "Run your pipeline from Claude, ChatGPT, Cursor…" | Grayscale→colour logo grid |
| 9 | Pricing | Convert | 3 cards, middle elevated + "Best value" ribbon |
| 10 | Founder story | Trust via specificity (Umer, ran an agency, built it for himself) | Photo, pull-quote, 3 paragraphs, mailto |
| 11 | FAQ | Handle the 9 real objections | Accordion, smooth height |
| 12 | Final CTA band | Last conversion surface | — |
| 13 | Mega footer | SEO surface area | 6 link columns + trademark/GDPR disclaimer |

### The exact "time lost" data (section 5)

| Task | Hours |
|---|---|
| Finding the right people | 5 |
| Checking who is a fit | 6 |
| Writing messages one by one | 5 |
| Writing posts nobody sees | 4 |
| Chasing follow-ups | 4 |
| Wondering why likes never become clients | 2 |
| Trying to stay consistent | ∞ |
| **Total** | **25+ hrs** |

Note the rhetorical trick: the largest bar (6h) is *checking fit*, not *finding people*. That sets up
intent scoring as the hero feature rather than list-building — which is what differentiates it from
Apollo/Instantly. The ∞ row deliberately breaks the bar chart's scale.

### The 5 solution mockups (must be real components, not images)

1. **Prospect discovery** — "Found 3 prospects on LinkedIn just now", rows fade in sequentially
   (Jordan M./Founder/Realm · Alex S./CEO/Brightform · Riya P./Founder/Nestpoint).
2. **Intent scoring** — `HOT 92/100` badge + "Why now" chips (Hiring SDRs · Engaged a competitor ·
   Posted about outbound · Changed roles 12 days ago) + a quoted post snippet.
3. **LinkedIn post card** — avatar, post body, reaction avatar stack, `9 reactions`,
   `3 buying signals created`.
4. **Multichannel sequence** — vertical 4-step timeline for *Sarah Jenkins, COO Maker Loop*:
   Day 0 LinkedIn → Day 2 Gmail → Day 4 LinkedIn → Day 7 Gmail, each with a chat-bubble preview.
   Caption: "Sent from your accounts — paced safely."
5. **Unified inbox** — 3 rows with colour-coded intent chips: Sarah Jenkins (Interested) ·
   Devon Wu (Question) · Maya R. (Not now).

These five mockups are the site's entire visual identity. They are also *the actual product UI in
miniature* — so in this build they are written once in `components/mockups/` and re-used inside the
dashboard, which is why the app and the marketing site feel like the same object.

---

## 3. Pricing model (drives the whole plan-gating layer)

| | **Pro** | **Growth** (Best value) | **Custom** |
|---|---|---|---|
| Price | ~~$89~~ **$59/mo** | ~~$149~~ **$100/mo** | Talk with us |
| Prospects / month | 2,000 | 4,000 | Custom |
| AI agents | 2 | 4 | Custom |
| Senders | 2 | 4 | More |
| LinkedIn posts / month | 35 | 100 | Custom |
| Team workspace | — | ✓ | Unlimited members |
| Support | Live chat | Live chat | Dedicated CSM + priority |

Shared by all plans: smart lead scoring (18 signals), email waterfall enrichment (25+ providers),
unified intent inbox, AI copilot mode, API/MCP/CSV export.

**Trial:** 7 days free, agents start immediately, cancel before end = no charge.

Three billing behaviours stated in the FAQ that are *product requirements*, not copy:

- Limits reset **on the user's own billing anchor date**, not the 1st of the month.
- Hitting a limit **pauses gracefully** — no overage charges, ever.
- Cancellation is **two clicks, no retention screen**.

These are implemented literally in `/app/billing` and in `usage_counters`.

---

## 4. The 9 FAQ objections (verbatim themes)

1. What is it → "An AI sales agent you hire."
2. Does it send for me → yes, from your accounts, human-paced, approvable.
3. Does it write posts → yes, voice-matched from **one** pasted sample; content is optional/second source.
4. Can it reply and book → yes, Autopilot; stops on "not interested".
5. Is my account safe → conservative daily caps, working-hours pacing, **disconnect in one click**.
6. How does pricing work → the table above.
7. Where do prospects come from → your own LinkedIn; Sales Navigator optional, not required.
8. What at limit → graceful pause, no surprise overage, resets on your billing date.
9. Cancel → two clicks, no retention calls.

Every one of these maps to a concrete UI affordance in the build (one-click disconnect, daily-cap
sliders, approval-mode radio group, usage bars, 2-click cancel).

---

## 5. Design language read

- **Dark, near-black canvas** with a single high-saturation accent; content lives on slightly-lifted
  cards with 1px hairline borders rather than heavy shadows.
- **Type does the work**: very large, tight, negative-tracking headlines; body copy stays small and
  muted. Headlines are written as complete sentences with periods — "Turn LinkedIn into your best
  salesperson." — which is a deliberate voice choice, not a typo.
- **Copy voice:** second person, short declaratives, concrete numbers, zero enterprise jargon. It says
  "9 reactions · 3 buying signals created", never "drive engagement".
- **Motion is evidential, not decorative.** Bars grow to prove the 25 hours. Prospect rows fade in one
  by one to prove discovery is happening *now*. The countdown ticks to prove the discount is real.

### Choices this build makes differently (and why)

| Reference | This build | Why |
|---|---|---|
| Nav: How it works / MCP / FAQ / Pricing | Full mega-menu (Features / Use cases / Solutions / Compare / Free Tools / Pricing / Blog) | The PRD's sitemap is far larger; the nav has to expose ~40 SEO routes |
| Static hero image | Live `<AppFrame>` composed of real mockup components | Same components render in the dashboard — one source of truth |
| Free tools as lead magnets | Same, but wired to a real Claude call through the backend | The PRD requires them to actually work |
| Brand: ProspectHalo | **OutreachHalo** | Avoids trademark/impersonation of a real, live company |

> **Note on the clone brief:** this is built as an original product named *OutreachHalo* using the
> reference's information architecture, section structure and UX patterns. Copy is rewritten rather
> than lifted, testimonials/founder story are clearly fictional placeholders, and no ProspectHalo
> branding, logo or real-person likeness is reproduced. Structure and interaction patterns are not
> protectable; verbatim marketing copy and brand assets are.

---

## 6. What is honestly buildable now vs. later

Phase 1 (this repo — complete and running):

- Entire marketing site, every route, real animations, real free tools.
- Supabase Auth + org bootstrap + 4-step onboarding with **real** Claude website analysis.
- Full multi-tenant dashboard on real Postgres with RLS: prospects (server-side filtering +
  pagination), sequence builder, unified inbox with AI reply drafting, content calendar with
  voice-matched generation, agents, integrations, settings, billing, team.
- FastAPI backend, JWT-verified, org-scoped, Stripe test mode, seeded so the dashboard is alive on
  first login.

Phase 2 (documented, deliberately not built):

- Real LinkedIn automation. **This is the hard blocker** — LinkedIn's User Agreement §8.2 prohibits
  automated scraping and unauthorised access; there is no public API for prospect search or DM
  sending. A compliant path needs either LinkedIn Partner Program access or an explicit,
  user-consented session model with real legal review. The reference site's own footer disclaims
  affiliation and pushes ToS responsibility to the user — telling.
- Real Gmail/Outlook OAuth send (needs Google/Microsoft app verification, ~4–6 weeks).
- The "25+ data provider" email waterfall (paid vendor contracts).
- A real MCP server exposing these as tools to Claude/ChatGPT/Cursor.

The data model and API contracts here are shaped so those slot in behind the existing endpoints
without touching a single UI component: `connected_accounts.status` already carries
`mock_connected → connected`, and every send path already writes through `messages` +
`automation_log`.
