import type { Faq } from './site'
import type { MockupKey } from './site'

/* ========================================================================== */
/* Shared shapes                                                              */
/* ========================================================================== */

export interface PageBullet {
  title: string
  body: string
}

export interface PageSection {
  heading: string
  body: string
  bullets?: string[]
}

export interface ContentPage {
  slug: string
  eyebrow: string
  title: string
  metaTitle: string
  metaDescription: string
  intro: string
  mockup?: MockupKey
  bullets: PageBullet[]
  sections: PageSection[]
  faq?: Faq[]
}

/* ========================================================================== */
/* /features/[slug] — 7 pages                                                 */
/* ========================================================================== */

export const FEATURE_PAGES: ContentPage[] = [
  {
    slug: 'ai-prospecting',
    eyebrow: 'AI prospecting',
    title: 'A fresh list of real buyers, every morning.',
    metaTitle: 'AI Prospecting — find scored B2B leads on LinkedIn daily',
    metaDescription:
      'Describe your buyer once. OutreachHalo searches your own LinkedIn every day, scores every match against your ICP across 18 intent signals, and learns from your feedback.',
    intro:
      'Most prospecting tools hand you a database and a filter. That is why the lists go stale and why everyone messages the same 400 people. OutreachHalo searches your own LinkedIn network and Sales Navigator, scores what it finds against your actual ideal customer, and shows you the evidence behind every score.',
    mockup: 'discovery',
    bullets: [
      { title: 'Sourced live, not bought', body: 'Every prospect comes from a search run today against your own connected account — never a resold CSV.' },
      { title: 'Scored, not just filtered', body: 'A 0–100 fit score combines firmographics with 18 behavioural signals, so a perfect title with zero intent ranks below an imperfect title that is actively hiring.' },
      { title: 'Improves with a thumbs-up', body: 'Marking a prospect good or bad re-weights the scoring for your workspace. Ten corrections visibly changes tomorrow’s list.' },
    ],
    sections: [
      {
        heading: 'What the 18 signals actually are',
        body: 'Signals fall into four families. Each one is timestamped, so you can see how fresh the evidence is before you send.',
        bullets: [
          'Hiring — open sales roles, SDR job posts, headcount growth quarter over quarter',
          'Change — role changes in the last 30 days, new office, funding announced, CRM switch',
          'Competitive — engaged a competitor’s content, evaluated an alternative, asked for recommendations',
          'Engagement — viewed your profile, reacted or commented on your post, attended a relevant event',
        ],
      },
      {
        heading: 'How the fit score is built',
        body: 'Firmographic match (title, headcount, industry, geography) sets the base. Intent signals adjust it up. Negative feedback from your workspace adjusts it down. The result is a number you can filter and sort on — and, more importantly, a "why now" list you can paste straight into a first line.',
      },
    ],
    faq: [
      { q: 'Do I need Sales Navigator?', a: 'No. Sales Navigator widens the search surface, but a standard LinkedIn account works.' },
      { q: 'Where is the data stored?', a: 'In your own workspace, isolated at the database level by row-level security. Nothing is shared between customers.' },
    ],
  },
  {
    slug: 'linkedin-outreach-automation',
    eyebrow: 'LinkedIn outreach',
    title: 'Messages that go out from your profile, not a burner.',
    metaTitle: 'LinkedIn Outreach Automation — send from your own account, safely',
    metaDescription:
      'Personalised LinkedIn messages written from each prospect’s real signals, sent from your own profile with conservative daily caps and working-hours pacing.',
    intro:
      'Outreach that comes from an unknown account gets ignored, and outreach that comes from a tool that blasts 200 a day gets your profile restricted. OutreachHalo does neither. It sends from the profile you already use, at a pace a person could plausibly type.',
    mockup: 'sequence',
    bullets: [
      { title: 'Written from the signal', body: 'The first line references the specific thing that changed — the hiring post, the role change, the comment they left.' },
      { title: 'Capped and paced', body: 'A per-account daily cap you set, spread across the working hours you choose, with warmup on new accounts.' },
      { title: 'You choose the leash', body: 'Approve the first message, approve every message, or let it run on autopilot. Change your mind per sequence, any time.' },
    ],
    sections: [
      {
        heading: 'Account safety is a product decision, not a promise',
        body: 'Three things protect the account you actually care about: a conservative cap (default 25/day, never more than 100), sends spread across a window rather than fired in a burst, and one-click disconnect that stops everything immediately.',
      },
      {
        heading: 'Merge tags and AI personalisation together',
        body: 'Templates support {{first_name}}, {{company}} and {{signal}} so the structure stays yours. Turn on AI personalisation per step and the agent rewrites the body around the prospect’s evidence while keeping your framing intact.',
      },
    ],
  },
  {
    slug: 'cold-email-automation',
    eyebrow: 'Cold email',
    title: 'Email that shares the same brain as your LinkedIn.',
    metaTitle: 'Cold Email Automation — Gmail and Outlook sequences that follow LinkedIn',
    metaDescription:
      'Run email and LinkedIn as one sequence from your own Gmail, Outlook or Google Workspace account, with per-account caps and shared reply detection.',
    intro:
      'Running email in one tool and LinkedIn in another means double the follow-ups and double the awkward moments where someone gets a cold email two hours after they replied on LinkedIn. One sequence, both channels, one reply detector.',
    mockup: 'sequence',
    bullets: [
      { title: 'Your domain, your reputation', body: 'Send from Gmail, Outlook or Google Workspace. No shared IP pools, no rented domains.' },
      { title: 'Reply-aware across channels', body: 'A reply on LinkedIn stops the email steps, and vice versa. Nobody gets chased after they answer.' },
      { title: 'Subject lines that survive the preview pane', body: 'Short, lower-case, specific to the signal. The agent writes them from the same evidence as the body.' },
    ],
    sections: [
      {
        heading: 'Deliverability without the theatre',
        body: 'We do not sell you a warmup network. Volume stays inside what a real person sends, sending is spread across your working hours, and every account has its own cap. That covers the vast majority of small-team deliverability problems without gaming anything.',
      },
      {
        heading: 'Compliance is on the sender — so we make it easy',
        body: 'You set your sending identity, your physical address footer and your opt-out language once in settings. Under CAN-SPAM and GDPR the responsibility sits with the account owner, so the product makes the honest path the default one.',
      },
    ],
  },
  {
    slug: 'automated-follow-ups',
    eyebrow: 'Follow-ups',
    title: 'The follow-up you always meant to send.',
    metaTitle: 'Automated Follow-ups — multi-step sequences that stop on reply',
    metaDescription:
      'Most replies come from touch three and four. OutreachHalo runs the whole sequence on your schedule and stops the moment someone answers.',
    intro:
      'Nobody is bad at the first message. Everybody is bad at the fourth. Roughly half of all replies arrive after the second touch, and those are the ones that get skipped when delivery gets busy.',
    mockup: 'sequence',
    bullets: [
      { title: 'Day-based, not blast-based', body: 'Each step waits a set number of days after the previous one, respecting weekends and your sending window.' },
      { title: 'Stops on any answer', body: 'A reply on either channel completes the enrollment. No "just circling back" after someone already said yes.' },
      { title: 'Escalates channel', body: 'A typical sequence walks LinkedIn → email → LinkedIn → email, so you are never relying on one inbox.' },
    ],
    sections: [
      {
        heading: 'A sequence that is worth copying',
        body: 'Day 0 LinkedIn: reference the signal, ask one question. Day 2 email: the same idea with one concrete number. Day 4 LinkedIn: did this land? Day 7 email: close the loop and stop. Four touches, one week, then silence — which is more respectful than a twelve-step drip.',
      },
    ],
  },
  {
    slug: 'unified-reply-inbox',
    eyebrow: 'Unified inbox',
    title: 'One inbox, sorted by who is ready to buy.',
    metaTitle: 'Unified Reply Inbox — every LinkedIn and email reply in one place',
    metaDescription:
      'Replies from every channel land in one inbox, auto-classified as interested, question or not now, with the prospect’s signals attached.',
    intro:
      'The reason replies go cold is not that people forget to answer. It is that the answer is in a different app than the one they are in. Every reply — LinkedIn or email — arrives here, tagged by intent, with the full signal history one click away.',
    mockup: 'inbox',
    bullets: [
      { title: 'Classified on arrival', body: 'Interested, Question, Not now or Neutral — applied automatically, editable by you.' },
      { title: 'Context attached', body: 'The prospect’s fit score, signals and full message history sit beside the thread, so you never reply blind.' },
      { title: 'Draft in one click', body: 'Generate a reply from the conversation plus their signals, edit it, send it. Or hand the thread to Autopilot.' },
    ],
    sections: [
      {
        heading: 'Why intent tagging beats unread counts',
        body: 'An unread badge tells you there is work. An intent tag tells you which work is worth doing first. Sorting by "Interested" turns a 40-reply backlog into a five-minute morning.',
      },
    ],
  },
  {
    slug: 'autopilot-closing',
    eyebrow: 'Autopilot',
    title: 'It answers, proposes a time, and books it.',
    metaTitle: 'Autopilot Closing — AI replies that book the meeting',
    metaDescription:
      'Turn Autopilot on per conversation and the agent answers questions, proposes the next step and shares your booking link the moment someone is ready.',
    intro:
      'Autopilot is opt-in, per conversation, and reversible mid-thread. When it is on, the agent writes and sends the next message toward one goal: a booked meeting. When someone says no, it stops.',
    mockup: 'inbox',
    bullets: [
      { title: 'Goal-directed, not chatty', body: 'Every reply moves toward a specific next step. It does not generate small talk to look busy.' },
      { title: 'Knows when to stop', body: '"Not interested" ends the thread and marks the prospect closed. No pushing past a clear no.' },
      { title: 'Shares your real booking link', body: 'The link from your settings — Cal.com, Calendly, whatever you already use.' },
    ],
    sections: [
      {
        heading: 'Every autopilot action is logged',
        body: 'Whether a message was written by you, drafted by AI and approved, or sent fully automatically, it is recorded in the automation log with an actor of "ai" or "human". You can always reconstruct exactly what your account said and when.',
      },
    ],
  },
  {
    slug: 'linkedin-content-generation',
    eyebrow: 'LinkedIn content',
    title: 'Posts in your voice. Leads as the point.',
    metaTitle: 'AI LinkedIn Content Generation — posts in your voice that create leads',
    metaDescription:
      'Paste one post you wrote. OutreachHalo matches your rhythm and vocabulary, publishes on your cadence, and turns everyone who engages into a scored lead.',
    intro:
      'Most AI writing tools produce content that is obviously not yours — three-word sentences, a rocket emoji, a fake epiphany. This one starts from a post you actually wrote and matches how you already sound.',
    mockup: 'post',
    bullets: [
      { title: 'One sample is enough', body: 'Paste a single post. Rhythm, sentence length, vocabulary and opener style get matched from it.' },
      { title: 'Aimed at your buyers', body: 'Topics are drawn from your ICP and business profile, so the people who engage are the people you want.' },
      { title: 'Engagement becomes pipeline', body: 'Anyone who reacts or comments and matches your ICP is scored and added, and their first message references the exact post.' },
    ],
    sections: [
      {
        heading: 'Content is a second source of leads, not a requirement',
        body: 'Your agent finds and contacts matching people from LinkedIn every day whether or not you ever publish. Content compounds on top of that — it just makes the outbound land warmer, because they have seen your name.',
      },
    ],
  },
]

/* ========================================================================== */
/* /solutions/[slug] — 4 pages                                                */
/* ========================================================================== */

export const SOLUTION_PAGES: ContentPage[] = [
  {
    slug: 'for-founders',
    eyebrow: 'For founders',
    title: 'Pipeline that keeps running while you build.',
    metaTitle: 'AI Sales Agent for Founders — pipeline without hiring an SDR',
    metaDescription:
      'Founder-led sales without the founder-led calendar. OutreachHalo runs prospecting, outreach and content so the pipeline survives a busy delivery month.',
    intro:
      'Founder-led sales works right up until the product needs you. Then outreach stops, and six weeks later the pipeline is empty for reasons that have nothing to do with your market.',
    mockup: 'discovery',
    bullets: [
      { title: 'Survives your busy weeks', body: 'The agent does not care that you shipped a release. It sends every working day at the pace you set.' },
      { title: 'Sounds like you', body: 'Trained on your website and one post you wrote, not a generic sales persona.' },
      { title: 'Costs less than a tenth of an SDR', body: 'A junior SDR is roughly $5,000/month fully loaded. This starts at $59.' },
    ],
    sections: [
      {
        heading: 'The first 90 days',
        body: 'Week one: connect accounts, confirm the ICP, approve the first messages by hand so you can see the voice. Week two to four: move to approve-all and start publishing. Month two onward: autopilot the interested threads and spend your time on calls only.',
      },
    ],
  },
  {
    slug: 'for-agencies',
    eyebrow: 'For agencies',
    title: 'Land clients while you are delivering for clients.',
    metaTitle: 'AI Sales Agent for Agencies — new business without pausing delivery',
    metaDescription:
      'Agencies lose pipeline every time a big project lands. OutreachHalo keeps prospecting and posting through delivery crunches, from your own accounts.',
    intro:
      'Every agency knows the cycle: win a big retainer, stop selling, deliver hard, then panic in eight weeks. The problem is not lead quality — it is that business development is the first thing that gets dropped.',
    mockup: 'sequence',
    bullets: [
      { title: 'Prospecting that does not pause', body: 'Delivery crunch or not, the daily list still lands and the sequence still sends.' },
      { title: 'Positioning per service line', body: 'Run separate agents and sequences for each offer, each with its own ICP and message.' },
      { title: 'Your voice, on your profile', body: 'Sent from the founder’s account, where the credibility already is.' },
    ],
    sections: [
      {
        heading: 'Running it for clients too',
        body: 'On Growth and Custom, the shared workspace lets a team manage several senders and agents side by side. Each client gets its own sequences, its own ICP and its own reporting inside one login.',
      },
    ],
  },
  {
    slug: 'for-sales-teams',
    eyebrow: 'For sales teams',
    title: 'Give every rep a research team.',
    metaTitle: 'AI Sales Agent for Sales Teams — remove list-building from the rep’s day',
    metaDescription:
      'Reps spend most of their week on list-building and research. OutreachHalo does the finding, scoring and first drafts so the rep does the selling.',
    intro:
      'The average rep spends a startling share of their week on work that is not selling: building lists, checking fit, researching a "why now", and rewriting the same opener. All four are automatable. The conversation is not.',
    mockup: 'intent',
    bullets: [
      { title: 'Every rep starts the day with a queue', body: 'Scored, evidenced, and already drafted — the rep edits and sends.' },
      { title: 'Shared workspace and seats', body: 'Growth includes a shared workspace so managers see every sequence and reply rate in one view.' },
      { title: 'Approval modes per rep', body: 'New reps run approve-every-message. Senior reps run autopilot. Same tool.' },
    ],
    sections: [
      {
        heading: 'What stays human',
        body: 'Discovery calls, pricing conversations, anything with a real objection. The agent’s job ends when a meeting is booked — which is exactly the line most teams already want to draw.',
      },
    ],
  },
  {
    slug: 'for-startups',
    eyebrow: 'For startups',
    title: 'Your first hundred customers, found on purpose.',
    metaTitle: 'AI Sales Agent for Startups — find your first 100 customers',
    metaDescription:
      'Early-stage outbound is an ICP experiment. OutreachHalo lets you test three ideal customer profiles a month instead of one a quarter.',
    intro:
      'Early outbound is not a volume problem, it is a targeting experiment. You are trying to learn which of four possible buyers actually responds — and manual prospecting means you only get to run that experiment once a quarter.',
    mockup: 'discovery',
    bullets: [
      { title: 'Test an ICP in a week', body: 'Change the profile, get a new scored list tomorrow, read reply rates by Friday.' },
      { title: 'Evidence, not vibes', body: 'Reply rate per sequence and per signal type tells you which hypothesis is actually working.' },
      { title: 'No annual contract', body: 'Monthly, cancel in two clicks, no retention call.' },
    ],
    sections: [
      {
        heading: 'How to read the results',
        body: 'Do not judge an ICP on volume of replies — judge it on the ratio of "Interested" to "Not now" in the inbox. A profile that produces polite curiosity is a worse signal than a smaller profile that produces booked calls.',
      },
    ],
  },
]

/* ========================================================================== */
/* /use-cases/[slug] — 5 pages                                                */
/* ========================================================================== */

export const USE_CASE_PAGES: ContentPage[] = [
  {
    slug: 'linkedin-lead-generation',
    eyebrow: 'Use case',
    title: 'LinkedIn lead generation, on a schedule.',
    metaTitle: 'LinkedIn Lead Generation — automated, scored, sent from your profile',
    metaDescription:
      'Turn your LinkedIn account into a daily lead source: scored matches, signal-based first lines and human-paced sending.',
    intro:
      'LinkedIn is still where B2B buyers are reachable without an email address. The bottleneck was never the channel — it was that searching, scoring and writing takes an hour a day that nobody has.',
    mockup: 'discovery',
    bullets: [
      { title: 'Daily scored matches', body: 'A fresh set every working morning, ranked by fit and intent.' },
      { title: 'Connection notes that get accepted', body: 'Short, specific, tied to something that actually changed at their company.' },
      { title: 'Safe volume', body: 'Conservative caps, working-hours pacing, one-click disconnect.' },
    ],
    sections: [
      {
        heading: 'What a realistic week looks like',
        body: 'Twenty-five connection notes a day, four-touch sequences behind them, and around one in nine replying. That is roughly ten conversations a week from a channel you were already logged into.',
      },
    ],
  },
  {
    slug: 'cold-email-automation',
    eyebrow: 'Use case',
    title: 'Cold email that is not a numbers game.',
    metaTitle: 'Cold Email Automation — signal-based sequences from your own inbox',
    metaDescription:
      'Send fewer, better emails from your own Gmail or Outlook, each one written from a real buying signal, with follow-ups that stop on reply.',
    intro:
      'Sending 5,000 emails to a bought list is a deliverability problem wearing a growth costume. Sending 40 a day from your own domain, each referencing something specific and true, is a business.',
    mockup: 'sequence',
    bullets: [
      { title: 'Your domain only', body: 'No rented sending domains, no shared pools.' },
      { title: 'A real first line', body: 'Written from the prospect’s evidence, not a spun template.' },
      { title: 'Stops on reply, everywhere', body: 'Cross-channel reply detection ends the sequence immediately.' },
    ],
    sections: [
      {
        heading: 'Volume guidance',
        body: 'Start at 20 a day per mailbox for the first fortnight, then move to 40. Watch the reply-to-send ratio rather than the raw number: if replies fall as volume rises, the targeting is wrong, not the copy.',
      },
    ],
  },
  {
    slug: 'win-more-customers',
    eyebrow: 'Use case',
    title: 'Win more customers from the same pipeline.',
    metaTitle: 'Win More Customers — faster replies, better timing, booked meetings',
    metaDescription:
      'Most lost deals are timing failures, not pitch failures. Intent scoring and same-hour replies fix the two that are actually fixable.',
    intro:
      'Two things reliably lose deals you could have won: arriving before the buyer had a reason to care, and answering an interested reply eleven hours late. Both are mechanical problems.',
    mockup: 'intent',
    bullets: [
      { title: 'Arrive at the right moment', body: '18 tracked signals mean you reach out the week something changed.' },
      { title: 'Answer while they are still reading', body: 'Autopilot or a one-click draft closes the response gap.' },
      { title: 'Never lose the thread', body: 'Every channel in one inbox, sorted by intent.' },
    ],
    sections: [
      {
        heading: 'The response-time number that matters',
        body: 'Reply speed to an "interested" message is the single highest-leverage metric in the whole funnel. Everything else — copy, cadence, list size — moves the needle less than answering within the hour.',
      },
    ],
  },
  {
    slug: 'inbound-lead-generation',
    eyebrow: 'Use case',
    title: 'Make your posts produce pipeline.',
    metaTitle: 'Inbound Lead Generation from LinkedIn Content',
    metaDescription:
      'Publish in your own voice on a cadence, then convert everyone who engages into a scored lead with a message that references the exact post.',
    intro:
      'Likes are not the product. The people behind the likes are. The gap between a post that performs and a post that produces pipeline is whether anybody follows up with the people who engaged.',
    mockup: 'post',
    bullets: [
      { title: 'Voice-matched from one sample', body: 'It sounds like you because it started from something you wrote.' },
      { title: 'Engagers get scored', body: 'React or comment plus an ICP match equals a lead in your pipeline.' },
      { title: 'Post-aware first messages', body: '"Thanks for the comment on the pricing post" beats "I saw you engaged with my content".' },
    ],
    sections: [
      {
        heading: 'Cadence that is sustainable',
        body: 'Two posts a week beats five for three weeks and then nothing. Pro covers 35 posts a month, which is more than most founders will ever publish — the limit exists so the number is never the reason you stopped.',
      },
    ],
  },
  {
    slug: 'replace-an-sdr',
    eyebrow: 'Use case',
    title: 'Replace the list-building half of an SDR.',
    metaTitle: 'Replace an SDR — what an AI sales agent can and cannot do',
    metaDescription:
      'An honest breakdown of which parts of the SDR role automate cleanly, which do not, and what the cost comparison actually looks like.',
    intro:
      'We are not going to tell you an AI replaces a good SDR. It replaces the part of the SDR role that a good SDR resents: building the list, checking fit, writing the fourth follow-up, and re-typing the same opener 200 times.',
    mockup: 'sequence',
    bullets: [
      { title: 'Automates cleanly', body: 'Sourcing, scoring, first drafts, follow-up scheduling, reply triage, meeting booking.' },
      { title: 'Does not automate', body: 'Discovery calls, real objection handling, pricing negotiation, relationship building.' },
      { title: 'The maths', body: '$5,000/month fully loaded versus $59. Even at a fraction of the output, the ratio is not close.' },
    ],
    sections: [
      {
        heading: 'The honest version',
        body: 'If you have a strong SDR, give them this and watch their meeting count rise, because you just gave them back the two-thirds of the week they spent in a spreadsheet. If you were about to make your first SDR hire and cannot yet describe your ICP in one sentence, run this for a quarter first — you will hire better afterwards.',
      },
    ],
  },
]

/* ========================================================================== */
/* /compare/[slug] and /alternatives/[slug]                                   */
/* ========================================================================== */

export interface ComparePage {
  slug: string
  competitor: string
  title: string
  metaTitle: string
  metaDescription: string
  intro: string
  positioning: string
  /** [capability, ours, theirs] */
  matrix: [string, string, string][]
  whenTheyWin: string
  whenWeWin: string
}

const COMPARE_MATRIX_BASE: [string, string, string][] = []

export const COMPARE_PAGES: ComparePage[] = [
  {
    slug: 'outreachhalo-vs-artisan',
    competitor: 'Artisan',
    title: 'OutreachHalo vs Artisan',
    metaTitle: 'OutreachHalo vs Artisan — AI SDR comparison (2026)',
    metaDescription:
      'How OutreachHalo and Artisan differ on data sourcing, sending accounts, inbound content and price. An honest side-by-side.',
    intro:
      'Both products describe themselves as an AI SDR. The real difference is where the prospects come from and whose accounts the messages leave from.',
    positioning:
      'Artisan is built around a large purchased contact database and an enterprise sales motion. OutreachHalo is built around your own LinkedIn account and a self-serve price point.',
    matrix: [
      ['Prospect source', 'Your own LinkedIn / Sales Navigator', 'Bundled B2B contact database'],
      ['Sends from', 'Your LinkedIn, Gmail, Outlook', 'Provisioned mailboxes'],
      ['LinkedIn content generation', 'Included on every plan', 'Not a core feature'],
      ['Entry price', '$59/month', 'Enterprise quote'],
      ['Contract', 'Monthly, cancel in 2 clicks', 'Typically annual'],
      ['Setup time', '10 minutes, self-serve', 'Guided onboarding'],
      ['MCP / AI agent access', 'Included on every plan', 'Not published'],
    ],
    whenTheyWin:
      'If you need a very large verified contact database out of the box, a dedicated CSM from day one, and procurement is comfortable with an annual contract, an enterprise AI SDR is the safer purchase.',
    whenWeWin:
      'If you are a founder, agency or small team who wants outreach to come from the profile people already trust — and you want to be live this afternoon for the price of a team lunch.',
  },
  {
    slug: 'outreachhalo-vs-apollo',
    competitor: 'Apollo',
    title: 'OutreachHalo vs Apollo',
    metaTitle: 'OutreachHalo vs Apollo — database vs agent (2026)',
    metaDescription:
      'Apollo sells you a contact database and a sequencer. OutreachHalo sells you an agent that does the work. Side-by-side comparison.',
    intro:
      'This is not really a like-for-like comparison, and pretending otherwise would be dishonest. Apollo is a data platform with sequencing attached. OutreachHalo is an agent that runs the motion.',
    positioning:
      'With Apollo you still do the work — you build the list, write the copy, schedule the steps. With OutreachHalo the finding, scoring and drafting happen without you, and your job is approval.',
    matrix: [
      ['Core product', 'AI agent that runs the motion', 'Contact database + sequencer'],
      ['Who writes the copy', 'The agent, from real signals', 'You, from templates'],
      ['Prospect source', 'Your LinkedIn, live', 'Their database'],
      ['Intent scoring', '18 signals, evidence attached', 'Available on higher tiers'],
      ['LinkedIn content', 'Included', 'Not offered'],
      ['Learning curve', 'Onboarding wizard, 10 min', 'Substantial'],
      ['Entry price', '$59/month', 'Free tier, paid tiers scale by credits'],
    ],
    whenTheyWin:
      'If your main need is verified email addresses at volume, or you have a rev-ops team who wants raw data to pipe elsewhere, a database platform is the right tool and we will not pretend otherwise.',
    whenWeWin:
      'If nobody on your team has three hours a week to build lists and write sequences, an agent beats a database — because an unused database produces zero meetings.',
  },
  {
    slug: 'outreachhalo-vs-instantly',
    competitor: 'Instantly',
    title: 'OutreachHalo vs Instantly',
    metaTitle: 'OutreachHalo vs Instantly — cold email volume vs multichannel timing',
    metaDescription:
      'Instantly optimises for cold email volume across many mailboxes. OutreachHalo optimises for timing across LinkedIn and email from your own accounts.',
    intro:
      'Two genuinely different philosophies about how outbound works. One says send more. The other says send at the right moment.',
    positioning:
      'Instantly is built for high-volume cold email with mailbox rotation and warmup. OutreachHalo is built for lower volume from your real accounts, timed to buying signals, across two channels.',
    matrix: [
      ['Primary channel', 'LinkedIn + email together', 'Email'],
      ['Sending model', 'Your own accounts, capped', 'Many mailboxes, rotated'],
      ['Volume philosophy', 'Fewer, better timed', 'High volume, warmed'],
      ['Prospect sourcing', 'Included, from your LinkedIn', 'Bring your own or buy leads'],
      ['Inbound content', 'Included', 'Not offered'],
      ['Reply handling', 'Intent-classified inbox + autopilot', 'Unibox'],
      ['Entry price', '$59/month', 'Tiered by mailbox count'],
    ],
    whenTheyWin:
      'If your motion genuinely depends on thousands of sends a month and you have the infrastructure and appetite to manage a fleet of domains, a volume-first tool is purpose-built for that.',
    whenWeWin:
      'If you would rather send 40 a day from the account with your face on it and have LinkedIn and email working from the same reply state.',
  },
  {
    slug: 'outreachhalo-vs-clay',
    competitor: 'Clay',
    title: 'OutreachHalo vs Clay',
    metaTitle: 'OutreachHalo vs Clay — enrichment workbench vs finished agent',
    metaDescription:
      'Clay is a powerful enrichment and workflow workbench. OutreachHalo is an opinionated finished agent. Which fits your team?',
    intro:
      'Clay is genuinely excellent at what it does. The question is whether you want a workbench or a finished tool.',
    positioning:
      'Clay gives you enrichment waterfalls, table logic and near-unlimited flexibility — and expects someone on your team to build the system. OutreachHalo ships the system already assembled and gives you fewer dials.',
    matrix: [
      ['Product shape', 'Opinionated agent', 'Flexible workbench'],
      ['Time to first message', 'Minutes', 'Days to weeks'],
      ['Who operates it', 'The founder or rep', 'A technical rev-ops owner'],
      ['Enrichment', 'Waterfall included, no config', 'Fully configurable, credit-based'],
      ['Sending', 'Built in, LinkedIn + email', 'Usually exported to a sender'],
      ['Content generation', 'Included', 'Not the focus'],
      ['Ceiling', 'Lower, but reached instantly', 'Very high with investment'],
    ],
    whenTheyWin:
      'If you have a rev-ops person who enjoys building systems and you need unusual enrichment logic, Clay will out-flex us permanently. That is a real advantage, not a consolation prize.',
    whenWeWin:
      'If the person who would have to build that system is also the person who has to close the deals.',
  },
]

export interface AlternativePage {
  slug: string
  competitor: string
  title: string
  metaTitle: string
  metaDescription: string
  intro: string
  reasons: PageBullet[]
  verdict: string
}

export const ALTERNATIVE_PAGES: AlternativePage[] = [
  {
    slug: 'apollo-alternative',
    competitor: 'Apollo',
    title: 'Looking for an Apollo alternative?',
    metaTitle: 'Apollo Alternative — an agent instead of a database (2026)',
    metaDescription:
      'The three reasons teams leave a contact database for an AI sales agent, and the one reason they stay.',
    intro:
      'People usually go looking for an Apollo alternative for one of three reasons: the data went stale, the credits ran out faster than expected, or nobody on the team had time to actually run the sequences.',
    reasons: [
      { title: 'Sourcing that does not go stale', body: 'Every prospect comes from a search run today against your own connected LinkedIn — there is no database to decay.' },
      { title: 'The work happens without you', body: 'Finding, scoring and drafting are done when you log in. You approve rather than build.' },
      { title: 'Predictable pricing', body: 'One monthly price, graceful pause at the limit, no credit maths and no overage invoices.' },
    ],
    verdict:
      'If what you actually need is bulk verified emails to pipe into another system, stay where you are — a database does that better. If you need meetings and nobody has time to run the machine, switch.',
  },
  {
    slug: 'instantly-alternative',
    competitor: 'Instantly',
    title: 'Looking for an Instantly alternative?',
    metaTitle: 'Instantly Alternative — multichannel outreach from your own accounts',
    metaDescription:
      'If managing a fleet of sending domains stopped being worth it, here is what the lower-volume, higher-signal version looks like.',
    intro:
      'The usual trigger is a deliverability scare, or the realisation that maintaining eight sending domains is a part-time job you did not apply for.',
    reasons: [
      { title: 'One account, capped', body: 'Send from the mailbox you already read, at a volume that never looks automated.' },
      { title: 'LinkedIn in the same sequence', body: 'Two channels, one reply state — no more emailing someone who already replied on LinkedIn.' },
      { title: 'Sourcing included', body: 'You do not need to buy a list before you can start.' },
    ],
    verdict:
      'Choose volume tooling if thousands of monthly sends is genuinely your model. Choose this if you would rather send forty good ones.',
  },
  {
    slug: 'artisan-alternative',
    competitor: 'Artisan',
    title: 'Looking for an Artisan alternative?',
    metaTitle: 'Artisan Alternative — self-serve AI SDR from $59/month',
    metaDescription:
      'Enterprise AI SDR pricing does not fit a five-person company. Here is the self-serve version of the same idea.',
    intro:
      'Most people searching this have had the demo, liked the product, and could not make the annual number work for a team of five.',
    reasons: [
      { title: 'Self-serve from $59', body: 'No demo required, no annual commitment, live the same afternoon.' },
      { title: 'Your accounts, not provisioned ones', body: 'Messages come from the profile your buyers already recognise.' },
      { title: 'Inbound included', body: 'Content generation and engagement-sourced leads on every plan.' },
    ],
    verdict:
      'If you need enterprise procurement, SSO and a named CSM, buy the enterprise product. If you need meetings next week, start the trial.',
  },
  {
    slug: 'best-ai-sdr-software',
    competitor: 'the category',
    title: 'Best AI SDR software in 2026',
    metaTitle: 'Best AI SDR Software 2026 — an honest category guide',
    metaDescription:
      'How to choose between AI SDR tools: the four questions that actually determine which one fits your team.',
    intro:
      'Every tool in this category claims the same outcome. The differences that matter are structural, and there are only four questions worth asking.',
    reasons: [
      { title: 'Where do the prospects come from?', body: 'A purchased database, or a live search of an account you own? This determines freshness more than any feature.' },
      { title: 'Whose accounts send?', body: 'Provisioned mailboxes are convenient and get ignored. Your own profile carries trust you cannot buy.' },
      { title: 'What is the approval model?', body: 'If a tool cannot run in approve-every-message mode, you cannot ease into it — and you will not trust it.' },
      { title: 'What happens at the limit?', body: 'Graceful pause or surprise overage invoice. Ask before you buy, not after.' },
    ],
    verdict:
      'There is no single best tool — there is the one that matches your volume philosophy. Answer the four questions and the shortlist writes itself.',
  },
]

/* ========================================================================== */
/* Industries                                                                 */
/* ========================================================================== */

export const INDUSTRIES: { name: string; body: string; signal: string }[] = [
  { name: 'B2B SaaS', body: 'Founders and heads of growth at 10–250 person software companies running an outbound motion.', signal: 'Opened a sales role in the last 30 days' },
  { name: 'Marketing agencies', body: 'Owners and new-business leads who need pipeline that survives delivery crunches.', signal: 'Published a new case study' },
  { name: 'Professional services', body: 'Consultancies and advisory firms where the partner is also the salesperson.', signal: 'Headcount growth quarter over quarter' },
  { name: 'Fintech', body: 'Revenue leaders selling into finance teams, where timing around budget cycles is everything.', signal: 'Budget cycle starting' },
  { name: 'Recruitment', body: 'Agencies whose buyers are hiring right now — the single cleanest intent signal there is.', signal: 'Posted 3+ open roles' },
  { name: 'Web3 and dev tools', body: 'Technical founders selling to other technical founders, where tone matters more than volume.', signal: 'Switched their stack' },
  { name: 'Commercial real estate', body: 'Brokers and advisors reaching operators around office moves and expansions.', signal: 'New office announced' },
  { name: 'Manufacturing and industrial', body: 'Sales leaders selling capital equipment where the buying window opens once a year.', signal: 'Capacity expansion announced' },
]

/* ========================================================================== */
/* Free tools                                                                 */
/* ========================================================================== */

export interface ToolField {
  name: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  required?: boolean
}

export interface ToolDef {
  slug: string
  name: string
  title: string
  metaTitle: string
  metaDescription: string
  intro: string
  /** Matches the `kind` accepted by POST /api/tools/generate. */
  kind: 'cold_email' | 'linkedin_post' | 'icp' | 'linkedin_message' | 'email_sequence'
  cta: string
  fields: ToolField[]
  tips: string[]
}

export const TOOL_PAGES: ToolDef[] = [
  {
    slug: 'ai-cold-email-generator',
    name: 'AI cold email generator',
    title: 'Free AI cold email generator',
    metaTitle: 'Free AI Cold Email Generator — write a cold email that gets replies',
    metaDescription:
      'Generate a short, specific cold email from what you sell and who you are writing to. Free, no signup, powered by Claude.',
    intro:
      'Describe what you sell and who you are writing to. You get a short email with a subject line, a first line tied to something real, and one clear ask.',
    kind: 'cold_email',
    cta: 'Write my email',
    fields: [
      { name: 'what_you_sell', label: 'What do you sell?', placeholder: 'Revenue attribution software for B2B teams', type: 'text', required: true },
      { name: 'recipient', label: 'Who are you writing to?', placeholder: 'Head of Growth at a 60-person SaaS company', type: 'text', required: true },
      { name: 'signal', label: 'What changed for them? (optional)', placeholder: 'They just posted three SDR roles', type: 'text' },
      { name: 'tone', label: 'Tone', placeholder: '', type: 'select', options: ['Direct', 'Friendly', 'Consultative', 'Blunt'] },
    ],
    tips: [
      'The first line should reference something that changed for them in the last 30 days.',
      'One ask per email. Two asks halve your reply rate.',
      'Under 90 words. If it needs scrolling on a phone, it is too long.',
    ],
  },
  {
    slug: 'ai-linkedin-post-generator',
    name: 'AI LinkedIn post generator',
    title: 'Free AI LinkedIn post generator',
    metaTitle: 'Free AI LinkedIn Post Generator — posts in your own voice',
    metaDescription:
      'Paste a topic and optionally one post you already wrote. Get a LinkedIn post that sounds like you, not like a template.',
    intro:
      'Give it a topic. If you paste a post you already wrote, it matches your rhythm and vocabulary instead of producing house-style AI copy.',
    kind: 'linkedin_post',
    cta: 'Write my post',
    fields: [
      { name: 'topic', label: 'What is the post about?', placeholder: 'Why our reply rate tripled when we changed the first line', type: 'text', required: true },
      { name: 'audience', label: 'Who is it for?', placeholder: 'B2B founders doing their own outbound', type: 'text', required: true },
      { name: 'voice_sample', label: 'Paste a post you wrote (optional — this is what makes it sound like you)', placeholder: 'Paste 100–200 words of something you actually published…', type: 'textarea' },
    ],
    tips: [
      'One idea per post. The scroll does not reward completeness.',
      'Open with the claim, not the setup.',
      'A specific number beats an adjective every time.',
    ],
  },
  {
    slug: 'ai-icp-generator',
    name: 'AI ICP generator',
    title: 'Free AI ICP generator',
    metaTitle: 'Free AI ICP Generator — define your ideal customer profile',
    metaDescription:
      'Turn a one-line description of your business into a structured ideal customer profile: titles, company size, industries, geographies and buying signals.',
    intro:
      'Describe your business in a sentence. You get a structured ICP — job titles, company size band, industries, geographies and the buying signals worth watching.',
    kind: 'icp',
    cta: 'Build my ICP',
    fields: [
      { name: 'business', label: 'What does your business do?', placeholder: 'We build revenue attribution software for B2B sales teams', type: 'text', required: true },
      { name: 'best_customer', label: 'Describe your best customer so far (optional)', placeholder: 'A 70-person SaaS company with 4 reps and a rev-ops lead', type: 'text' },
    ],
    tips: [
      'A good ICP excludes more than it includes.',
      'If your ICP has more than six job titles, it is a market, not a profile.',
      'Company size band matters more than industry for most sellers.',
    ],
  },
  {
    slug: 'ai-linkedin-message-generator',
    name: 'AI LinkedIn message generator',
    title: 'Free AI LinkedIn message generator',
    metaTitle: 'Free AI LinkedIn Message Generator — connection notes that get accepted',
    metaDescription:
      'Generate a short LinkedIn connection note or DM that references something real and asks one question.',
    intro:
      'Connection notes have 300 characters. This writes one that earns the accept and opens a conversation instead of pitching in the first breath.',
    kind: 'linkedin_message',
    cta: 'Write my message',
    fields: [
      { name: 'recipient', label: 'Who are you messaging?', placeholder: 'Sarah Jenkins, COO at Maker Loop', type: 'text', required: true },
      { name: 'what_you_sell', label: 'What do you do?', placeholder: 'I help B2B teams see which outbound messages turn into revenue', type: 'text', required: true },
      { name: 'signal', label: 'Why now? (optional)', placeholder: 'She posted about scaling their outbound team', type: 'text' },
    ],
    tips: [
      'Under 300 characters or LinkedIn truncates it.',
      'Do not pitch in a connection note. Earn the accept first.',
      'End on a question they can answer in one line.',
    ],
  },
  {
    slug: 'ai-email-sequence-generator',
    name: 'AI email sequence generator',
    title: 'Free AI email sequence generator',
    metaTitle: 'Free AI Email Sequence Generator — a 4-touch sequence in seconds',
    metaDescription:
      'Generate a complete multi-touch outbound sequence with day delays, subject lines and bodies you can paste straight into your sender.',
    intro:
      'Get a full four-touch sequence — day spacing, subject lines and bodies — built around one angle rather than four unrelated pitches.',
    kind: 'email_sequence',
    cta: 'Build my sequence',
    fields: [
      { name: 'what_you_sell', label: 'What do you sell?', placeholder: 'Revenue attribution software for B2B teams', type: 'text', required: true },
      { name: 'audience', label: 'Who is the sequence for?', placeholder: 'VP Sales at 50–200 person SaaS companies', type: 'text', required: true },
      { name: 'goal', label: 'What is the ask?', placeholder: 'A 15-minute call', type: 'text' },
    ],
    tips: [
      'Four touches over seven days beats twelve over six weeks.',
      'Each touch should add one new piece of information, not repeat the last.',
      'The final email should give them a clean way to say no.',
    ],
  },
]

/* ========================================================================== */
/* Blog                                                                       */
/* ========================================================================== */

export interface BlogPost {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  category: string
  date: string
  readingMinutes: number
  author: string
  body: PageSection[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'the-only-four-intent-signals-that-matter',
    title: 'The only four intent signals that actually predict a reply',
    metaTitle: 'The 4 Intent Signals That Predict a Reply — OutreachHalo blog',
    metaDescription:
      'We score 18 buying signals. Four of them do most of the work. Here is what they are and how to watch for them.',
    excerpt: 'We track eighteen. Four of them do most of the work — and one of them is barely used by anyone.',
    category: 'Outbound',
    date: '2026-07-28',
    readingMinutes: 6,
    author: 'Umar Rahman',
    body: [
      {
        heading: 'Signal quality is not the same as signal availability',
        body: 'The signals everyone uses — funding rounds, headcount growth — are the ones everyone else is also messaging on. By the time a Series A hits the news, that founder has forty identical emails. The useful signals are the ones that are visible but tedious to watch.',
      },
      {
        heading: '1. Open sales roles',
        body: 'A company hiring SDRs is a company that has already decided outbound is a priority and has budget attached to it. This is the single cleanest predictor we see. It is public, it is dated, and it maps directly onto intent.',
        bullets: ['Watch for 2+ roles, not 1 — a single role is often backfill', 'The first 14 days after posting is the window', 'Message the VP, not the recruiter'],
      },
      {
        heading: '2. A role change in the last 30 days',
        body: 'New leaders change tools. A VP Sales in month one has explicit permission to rip something out, and a 90-day window in which doing so is expected rather than disruptive. Month four is a different person entirely.',
      },
      {
        heading: '3. Engaging with a competitor',
        body: 'Someone commenting on a competitor’s post is doing your qualification for you: they have the problem and they are actively reading about it. This is the most under-used signal in B2B, mostly because it is annoying to monitor manually.',
      },
      {
        heading: '4. They engaged with you',
        body: 'A profile view or a comment is a warm lead that most people never follow up on. The reply rate on "thanks for the comment on X" messages is several times a cold opener — and the entire cost is remembering to send it.',
      },
      {
        heading: 'What to do with this',
        body: 'Pick two. Watch them properly rather than watching eight badly. And put the evidence in the first line — the signal is only worth something if the prospect can tell you noticed.',
      },
    ],
  },
  {
    slug: 'why-your-linkedin-posts-dont-produce-leads',
    title: 'Why your LinkedIn posts get likes and no leads',
    metaTitle: 'Why LinkedIn Posts Get Likes But No Leads — OutreachHalo blog',
    metaDescription:
      'The gap between engagement and pipeline is one step long, and almost nobody takes it.',
    excerpt: 'The gap between a post that performs and a post that produces pipeline is exactly one step long.',
    category: 'Inbound',
    date: '2026-07-14',
    readingMinutes: 5,
    author: 'Umar Rahman',
    body: [
      {
        heading: 'Engagement is a list, not a result',
        body: 'When a post gets 90 reactions, you have been handed a list of ninety people who raised their hand about a topic you sell into. Treating that as a vanity number rather than a lead list is the whole mistake.',
      },
      {
        heading: 'The step nobody takes',
        body: 'Open the reactions. Filter to people who match your ICP. Message them referencing the specific post. That is it. It takes twenty minutes per post and it converts several times better than cold outreach, because they already read something you wrote and did not hate it.',
      },
      {
        heading: 'Why nobody does it',
        body: 'Because it is twenty minutes of clicking, and the post already gave you the dopamine hit. The work happens after the reward, which is the worst possible ordering for human motivation. This is precisely the kind of task worth automating.',
      },
      {
        heading: 'Write for the reply, not the reach',
        body: 'A post that gets 200 reactions from your peers is worse than one that gets 20 from your buyers. Optimise the topic for who you want in the reaction list, and accept the smaller number.',
      },
    ],
  },
  {
    slug: 'how-many-cold-emails-per-day-is-safe',
    title: 'How many cold emails a day is actually safe?',
    metaTitle: 'How Many Cold Emails Per Day Is Safe? — OutreachHalo blog',
    metaDescription:
      'Sensible per-mailbox sending volumes, why warmup networks are overrated, and the ratio to watch instead of the raw number.',
    excerpt: 'The honest answer is lower than the tools tell you, and the number you should watch is not the number you think.',
    category: 'Deliverability',
    date: '2026-06-30',
    readingMinutes: 7,
    author: 'Umar Rahman',
    body: [
      {
        heading: 'The number',
        body: 'From an established mailbox on a domain with normal human traffic: 20 a day for the first two weeks, then 40. That is it. Anything above that and you are relying on infrastructure tricks rather than on being welcome.',
      },
      {
        heading: 'Why warmup networks are overrated',
        body: 'Warmup pools generate fake engagement between accounts that exist to generate fake engagement. Providers have been aware of this pattern for years. It is an arms race you are not funded to win, and it does nothing about the actual problem, which is that your emails are not interesting.',
      },
      {
        heading: 'Watch the ratio, not the volume',
        body: 'Track replies per hundred sent. If you double volume and the ratio holds, your targeting is fine. If the ratio drops, you have exhausted the good part of your list and are now emailing people who should never have been on it. Volume is not the lever; that ratio is.',
      },
      {
        heading: 'The uncomfortable implication',
        body: 'At 40 a day and a 9% reply rate you get roughly 70 conversations a month from one mailbox. If that is not enough pipeline, the fix is a better offer or a better list — not a bigger fleet of domains.',
      },
    ],
  },
  {
    slug: 'ai-sdr-what-it-can-and-cannot-do',
    title: 'What an AI SDR can and cannot do in 2026',
    metaTitle: 'What an AI SDR Can and Cannot Do (2026) — OutreachHalo blog',
    metaDescription:
      'An honest breakdown of which parts of the SDR role automate well, which do not, and how to decide.',
    excerpt: 'An honest inventory, including the parts that vendors in this category tend to skip.',
    category: 'Category',
    date: '2026-06-11',
    readingMinutes: 8,
    author: 'Umar Rahman',
    body: [
      {
        heading: 'What automates cleanly',
        body: 'Anything that is pattern-matching over public information, or writing a first draft from structured evidence.',
        bullets: [
          'Sourcing prospects against a defined profile',
          'Scoring fit and attaching evidence',
          'Writing a first message from that evidence',
          'Scheduling and sending follow-ups',
          'Classifying replies by intent',
          'Proposing times and sharing a booking link',
        ],
      },
      {
        heading: 'What does not',
        body: 'Anything that requires holding a relationship, reading a room, or making a commitment on your behalf.',
        bullets: [
          'Discovery calls',
          'Real objection handling — the kind where the objection is not the objection',
          'Pricing negotiation',
          'Knowing when to walk away from a bad-fit deal',
        ],
      },
      {
        heading: 'The honest failure mode',
        body: 'The way this goes wrong is not a robot embarrassing you in a DM. It is subtler: the agent produces a steady stream of technically-fine messages to a slightly-wrong ICP, and because the volume looks healthy nobody notices for two months. The defence is reading your inbox by intent tag weekly, not by volume.',
      },
      {
        heading: 'How to decide',
        body: 'If you can describe your ideal customer in one sentence and you are not currently doing outbound consistently, an agent will beat your status quo immediately. If you have a strong SDR already, give them the agent rather than replacing them.',
      },
    ],
  },
  {
    slug: 'the-first-line-problem',
    title: 'The first line problem',
    metaTitle: 'The First Line Problem in Cold Outreach — OutreachHalo blog',
    metaDescription:
      'Personalisation that mentions their podcast is not personalisation. Here is what actually earns the second sentence.',
    excerpt: '"Loved your recent post!" is not personalisation. It is a tell.',
    category: 'Copywriting',
    date: '2026-05-22',
    readingMinutes: 4,
    author: 'Umar Rahman',
    body: [
      {
        heading: 'The tell',
        body: 'Every buyer can now recognise a personalisation token at a glance. "Loved your post on X" reads as automated precisely because it is the thing automation is best at. Mentioning something true is table stakes; mentioning something consequential is the job.',
      },
      {
        heading: 'The test',
        body: 'Could this first line be sent to anyone else in their industry? If yes, delete it. "Saw you are hiring two SDRs" passes. "Congrats on the growth" does not.',
      },
      {
        heading: 'Structure that works',
        body: 'One sentence naming what changed. One sentence connecting it to a problem that change creates. One question. Stop. Ninety words total, and the question should be answerable without a meeting.',
      },
    ],
  },
  {
    slug: 'graceful-limits-why-we-dont-do-overage',
    title: 'Why we pause instead of charging overage',
    metaTitle: 'Why We Pause Instead of Charging Overage — OutreachHalo blog',
    metaDescription:
      'A short note on why hitting your monthly limit stops the agent rather than generating an invoice.',
    excerpt: 'A short product note about a decision that costs us money on purpose.',
    category: 'Product',
    date: '2026-05-02',
    readingMinutes: 3,
    author: 'Umar Rahman',
    body: [
      {
        heading: 'The decision',
        body: 'When you hit your monthly prospect or post limit, everything pauses. No overage charge, no surprise line item, no email that starts "just a heads up about your invoice".',
      },
      {
        heading: 'Why',
        body: 'Overage billing makes the vendor’s revenue go up when the customer loses control of their usage. That is a bad incentive to build a company on, and every founder who has ever been surprised by a bill knows exactly how it feels.',
      },
      {
        heading: 'The trade',
        body: 'It means occasionally your agent stops mid-month and you have to click upgrade. We think an interruption you chose is better than an invoice you did not. Limits reset on your own billing date, not the 1st.',
      },
    ],
  },
]

/* Helper lookups ---------------------------------------------------------- */

export const findFeature = (slug: string) => FEATURE_PAGES.find((p) => p.slug === slug)
export const findSolution = (slug: string) => SOLUTION_PAGES.find((p) => p.slug === slug)
export const findUseCase = (slug: string) => USE_CASE_PAGES.find((p) => p.slug === slug)
export const findCompare = (slug: string) => COMPARE_PAGES.find((p) => p.slug === slug)
export const findAlternative = (slug: string) => ALTERNATIVE_PAGES.find((p) => p.slug === slug)
export const findTool = (slug: string) => TOOL_PAGES.find((p) => p.slug === slug)
export const findPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug)

export { COMPARE_MATRIX_BASE }
