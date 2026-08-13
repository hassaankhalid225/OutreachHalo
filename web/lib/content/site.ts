/**
 * Single source of truth for marketing copy, navigation and the link graph.
 * Sitemap, footer, mega-menu and every static page read from here.
 */

export const SITE = {
  name: 'OutreachHalo',
  tagline: 'The AI sales agent that fills your pipeline, inbound and outbound.',
  description:
    'OutreachHalo learns your business from your website, finds ideal prospects on LinkedIn, runs multichannel outreach from your own accounts, and writes content that pulls buyers in.',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://outreachhalo.com',
  email: 'hello@outreachhalo.com',
  bookingUrl: 'https://cal.com/outreachhalo/demo',
  social: {
    x: 'https://x.com/outreachhalo',
    linkedin: 'https://www.linkedin.com/company/outreachhalo',
  },
} as const

/* ------------------------------------------------------------------- Nav */

export interface NavLink {
  label: string
  href: string
  description?: string
}

export interface NavGroup {
  label: string
  href: string
  /** Rendered as a mega-menu when present. */
  items?: NavLink[]
  featured?: { title: string; body: string; href: string; cta: string }
}

export const NAV: NavGroup[] = [
  {
    label: 'Features',
    href: '/features',
    items: [
      { label: 'AI prospecting', href: '/features/ai-prospecting', description: 'A fresh, scored list every morning' },
      { label: 'LinkedIn outreach', href: '/features/linkedin-outreach-automation', description: 'Sent from your own profile' },
      { label: 'Cold email automation', href: '/features/cold-email-automation', description: 'Gmail and Outlook, paced safely' },
      { label: 'Automated follow-ups', href: '/features/automated-follow-ups', description: 'Until there is an answer' },
      { label: 'Unified reply inbox', href: '/features/unified-reply-inbox', description: 'Sorted by who is ready to buy' },
      { label: 'Autopilot closing', href: '/features/autopilot-closing', description: 'Answers, then books the meeting' },
      { label: 'LinkedIn content', href: '/features/linkedin-content-generation', description: 'Posts in your voice, not house AI' },
    ],
    featured: {
      title: 'See the whole loop',
      body: 'Outbound and inbound running from one agent, on one dashboard.',
      href: '/features',
      cta: 'Tour the product',
    },
  },
  {
    label: 'Use cases',
    href: '/use-cases',
    items: [
      { label: 'LinkedIn lead generation', href: '/use-cases/linkedin-lead-generation' },
      { label: 'Cold email automation', href: '/use-cases/cold-email-automation' },
      { label: 'Win more customers', href: '/use-cases/win-more-customers' },
      { label: 'Inbound lead generation', href: '/use-cases/inbound-lead-generation' },
      { label: 'Replace an SDR', href: '/use-cases/replace-an-sdr' },
    ],
  },
  {
    label: 'Solutions',
    href: '/solutions',
    items: [
      { label: 'For founders', href: '/solutions/for-founders', description: 'Pipeline without hiring' },
      { label: 'For agencies', href: '/solutions/for-agencies', description: 'Land clients while you deliver' },
      { label: 'For sales teams', href: '/solutions/for-sales-teams', description: 'Give every rep a research team' },
      { label: 'For startups', href: '/solutions/for-startups', description: 'First 100 customers, faster' },
      { label: 'Industries', href: '/industries', description: 'How it plays out by vertical' },
    ],
  },
  {
    label: 'Compare',
    href: '/compare',
    items: [
      { label: 'All comparisons', href: '/compare' },
      { label: 'vs Artisan', href: '/compare/outreachhalo-vs-artisan' },
      { label: 'vs Apollo', href: '/compare/outreachhalo-vs-apollo' },
      { label: 'vs Instantly', href: '/compare/outreachhalo-vs-instantly' },
      { label: 'vs Clay', href: '/compare/outreachhalo-vs-clay' },
      { label: 'All alternatives', href: '/alternatives' },
    ],
  },
  {
    label: 'Free tools',
    href: '/tools',
    items: [
      { label: 'AI cold email generator', href: '/tools/ai-cold-email-generator' },
      { label: 'AI LinkedIn post generator', href: '/tools/ai-linkedin-post-generator' },
      { label: 'AI ICP generator', href: '/tools/ai-icp-generator' },
      { label: 'AI LinkedIn message generator', href: '/tools/ai-linkedin-message-generator' },
      { label: 'AI email sequence generator', href: '/tools/ai-email-sequence-generator' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
]

/* ---------------------------------------------------------------- Footer */

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Features', href: '/features' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'MCP server', href: '/mcp-server' },
      { label: 'For AI agents', href: '/for-agents' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For founders', href: '/solutions/for-founders' },
      { label: 'For agencies', href: '/solutions/for-agencies' },
      { label: 'For sales teams', href: '/solutions/for-sales-teams' },
      { label: 'For startups', href: '/solutions/for-startups' },
      { label: 'Use cases', href: '/use-cases' },
      { label: 'Industries', href: '/industries' },
    ],
  },
  {
    title: 'Compare',
    links: [
      { label: 'All comparisons', href: '/compare' },
      { label: 'vs Artisan', href: '/compare/outreachhalo-vs-artisan' },
      { label: 'vs Apollo', href: '/compare/outreachhalo-vs-apollo' },
      { label: 'vs Instantly', href: '/compare/outreachhalo-vs-instantly' },
      { label: 'All alternatives', href: '/alternatives' },
      { label: 'Apollo alternative', href: '/alternatives/apollo-alternative' },
    ],
  },
  {
    title: 'Free tools',
    links: [
      { label: 'Cold email generator', href: '/tools/ai-cold-email-generator' },
      { label: 'LinkedIn post generator', href: '/tools/ai-linkedin-post-generator' },
      { label: 'ICP generator', href: '/tools/ai-icp-generator' },
      { label: 'LinkedIn message generator', href: '/tools/ai-linkedin-message-generator' },
      { label: 'Email sequence generator', href: '/tools/ai-email-sequence-generator' },
      { label: 'All free tools', href: '/tools' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: `mailto:${SITE.email}` },
      { label: 'Sign in', href: '/sign-in' },
      { label: 'Start free', href: '/sign-up' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Refund policy', href: '/refund' },
    ],
  },
]

export const LEGAL_DISCLAIMER =
  'OutreachHalo is not affiliated with, endorsed by, or sponsored by LinkedIn, Microsoft, or Google. LinkedIn is a trademark of LinkedIn Corporation; all other product names, logos and trademarks are the property of their respective owners. You connect your own accounts and are responsible for following each platform’s terms and applicable laws, including GDPR and CAN-SPAM, when you reach out.'

/* ------------------------------------------------------------------- Hero */

export const HERO = {
  eyebrow: 'AI Sales Agent',
  headline: 'Turn LinkedIn into your best salesperson.',
  sub: 'Enter your website. OutreachHalo learns your business, finds ideal prospects, runs multichannel outreach from your own accounts, and creates LinkedIn content that drives more sales.',
  cta: 'Launch my agent for free',
  secondaryCta: 'See how it works',
  socialProof: 'Trusted by founders, agencies and sales teams',
  proofNames: ['Sarah Jenkins', 'Devon Wu', 'Maya Rodriguez', 'Tomas Herrera', 'Nina Kowalski', 'Ben Okafor', 'Grace Lindqvist', 'Priya Nair'],
} as const

export const TRUST_STRIP = 'Posts and sends from the accounts you already own'

/* ----------------------------------------------------------- Testimonials */

export interface Testimonial {
  quote: string
  name: string
  role: string
  company: string
  metric?: string
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'We used OutreachHalo to find prospects for our studio and closed a $3,000 client in 9 days on the entry plan. That is a 50x return in just over a week.',
    name: 'Sami Haidar',
    role: 'CEO',
    company: 'Yellow Horns',
    metric: '$3k closed in 9 days',
  },
  {
    quote:
      'We build automation for brokerages all day, so the bar was high. It replaced the manual prospecting we were doing by hand and now books conversations for our own pipeline.',
    name: 'Muhammad Sameer',
    role: 'CEO',
    company: 'Pilotly',
    metric: 'Manual prospecting removed',
  },
  {
    quote:
      'The intent scoring is the part I did not expect. It surfaced two accounts that were quietly hiring SDRs and both replied the same day.',
    name: 'Grace Lindqvist',
    role: 'Head of Revenue',
    company: 'Tidewell',
    metric: '2 same-day replies',
  },
  {
    quote:
      'I pasted one post I had written and the drafts came back sounding like me. That was the moment I stopped babysitting it.',
    name: 'Maya Rodriguez',
    role: 'Founder',
    company: 'Cadence Studio',
    metric: '11% reply rate',
  },
  {
    quote:
      'Our reply rate went from 4% to 11% in three weeks. The copy did not get better — the timing did.',
    name: 'Tomas Herrera',
    role: 'VP Sales',
    company: 'Kestrel Data',
    metric: '4% → 11% replies',
  },
]

/* ---------------------------------------------------------------- Problem */

export const PROBLEM = {
  eyebrow: 'Problem',
  headline: 'You didn’t start a company to chase leads all day.',
  subhead: 'Here is where your week actually goes.',
  body: 'Prospecting quietly eats your week. You find people, check if they fit, write every message by hand, then chase follow-ups. Posting eats the rest, and the likes never turn into conversations. It never gets easier, and it is time your business needs.',
  rows: [
    { label: 'Finding the right people', hours: 5 },
    { label: 'Checking who is a fit', hours: 6 },
    { label: 'Writing messages one by one', hours: 5 },
    { label: 'Writing posts nobody sees', hours: 4 },
    { label: 'Chasing follow-ups', hours: 4 },
    { label: 'Wondering why likes never become clients', hours: 2 },
    { label: 'Trying to stay consistent', hours: Infinity },
  ],
  total: '25+ hrs',
  totalLabel: 'Every single week',
  closing: 'That’s not growth. That’s manual sales work.',
} as const

/* --------------------------------------------------------------- Solution */

export type MockupKey = 'discovery' | 'intent' | 'post' | 'sequence' | 'inbox'

export interface SolutionBlock {
  eyebrow: string
  headline: string
  body: string
  mockup: MockupKey
  href: string
  bullets: string[]
}

export const SOLUTION_INTRO = {
  eyebrow: 'Solution',
  headline: 'More sales conversations. Without more hours.',
  body: 'Tell it who you sell to. It finds them on LinkedIn, writes and sends every message from your own account, and posts content that pulls more of them in. From day one.',
} as const

export const SOLUTION_BLOCKS: SolutionBlock[] = [
  {
    eyebrow: 'From your LinkedIn',
    headline: 'Never run out of people to sell to.',
    body: 'Describe your buyer once and a fresh set of real matches lands every day, pulled from your own LinkedIn or Sales Navigator and scored against your ideal customer. It gets sharper every time you mark a lead good or bad. No bought lists, no stale database.',
    mockup: 'discovery',
    href: '/features/ai-prospecting',
    bullets: ['Scored against your ICP, not a job title filter', 'Learns from every thumbs up or down', 'No list purchase, no scraped CSV'],
  },
  {
    eyebrow: 'Intent signals',
    headline: 'Reach them while they are ready to buy.',
    body: 'Timing is most of why outreach works. It watches 18 kinds of buying intent — from hiring and job changes to competitor interest — so you arrive when something has actually changed. Every hot lead shows the evidence behind it.',
    mockup: 'intent',
    href: '/features/ai-prospecting',
    bullets: ['18 tracked signal types', 'Evidence attached to every score', 'Hot leads surface to the top of the queue'],
  },
  {
    eyebrow: 'Inbound content',
    headline: 'Get buyers coming to you.',
    body: 'Paste one post you wrote and it writes in your voice, not house-style AI. Posts go out on a cadence you set, images included, aimed at the same buyers. Everyone who engages becomes a scored lead.',
    mockup: 'post',
    href: '/features/linkedin-content-generation',
    bullets: ['Voice-matched from a single sample', 'Scheduled on your cadence', 'Engagers become scored leads automatically'],
  },
  {
    eyebrow: 'Multichannel outreach',
    headline: 'Every message written and sent for you.',
    body: 'You choose the leash. Approve the first message, approve every message, or let it run. Your agent writes from each prospect’s real signals and follows up until there is an answer. Daily caps and warmup keep your accounts safe.',
    mockup: 'sequence',
    href: '/features/linkedin-outreach-automation',
    bullets: ['LinkedIn and email in one sequence', 'Approve-first, approve-all, or autopilot', 'Daily caps and working-hours pacing'],
  },
  {
    eyebrow: 'Unified inbox',
    headline: 'Replies answered. Meetings booked.',
    body: 'Every reply lands in one inbox, sorted by who is ready to buy. Autopilot answers questions, proposes the next step, and shares your booking link the moment someone is ready. If a hot lead is waiting on you, you get an email within the hour.',
    mockup: 'inbox',
    href: '/features/unified-reply-inbox',
    bullets: ['Intent-classified on arrival', 'Autopilot shares your booking link', 'Hot-reply alerts within the hour'],
  },
]

/* ----------------------------------------------------------- How it works */

export interface HowStep {
  key: string
  kicker: string
  title: string
  body: string
  mockup: MockupKey | 'setup' | 'close'
}

export const HOW_IT_WORKS = {
  eyebrow: 'How it works',
  headline: 'Four steps. Then it runs itself.',
  body: 'From one sentence to a working sales agent. No copy-pasting, no setup weekend, no five tools to stitch together.',
  steps: [
    {
      key: 'setup',
      kicker: 'Setup',
      title: 'Enter your website',
      body: 'OutreachHalo reads your site and instantly understands what you sell, who you target, and how to pitch you.',
      mockup: 'setup',
    },
    {
      key: 'outbound',
      kicker: 'Outbound',
      title: 'Your agent finds your buyers',
      body: 'Every day it finds matching people on your LinkedIn and messages them from your own account, timed to a real buying signal.',
      mockup: 'sequence',
    },
    {
      key: 'inbound',
      kicker: 'Inbound',
      title: 'At the same time, posts pull buyers in',
      body: 'It writes posts in your voice aimed at those same buyers. Anyone who engages becomes a warm, scored lead.',
      mockup: 'post',
    },
    {
      key: 'close',
      kicker: 'Close',
      title: 'Replies land, deals get closed',
      body: 'Replies land in one inbox, sorted by who is ready to buy. Autopilot answers and books the meeting.',
      mockup: 'close',
    },
  ] satisfies HowStep[],
} as const

/* ----------------------------------------------------------- Integrations */

export const INTEGRATIONS_SECTION = {
  eyebrow: 'Integrations',
  headline: 'Connect OutreachHalo to your favourite AI agents.',
  body: 'Run your pipeline from Claude, ChatGPT, Cursor or any other AI agent. Ask for leads, launch agents, schedule posts, check what is working. Included on every plan.',
  primaryLink: { label: 'Set up in 2 minutes', href: '/mcp-server' },
  secondaryLink: { label: 'Read the agent guide', href: '/for-agents' },
} as const

/* ------------------------------------------------------------ Founder note */

export const FOUNDER = {
  name: 'Umar Rahman',
  role: 'Founder, OutreachHalo',
  pullQuote: 'I was spending more time hunting for leads than doing the work clients paid me for.',
  paragraphs: [
    'Hey founder, I’m Umar. I ran my own agency, and every week went the same way. Finding the right people, checking whether they were actually a fit, writing each message by hand, then chasing follow-ups before leads went cold. It ate the days I should have spent on client work.',
    'And the moment delivery got busy, outreach stopped completely — so the pipeline dried up a month later. That lag is what kills small agencies, not a bad month of sales.',
    'So I built OutreachHalo. It does the finding, the scoring and the first messages from my own LinkedIn and email, paced like a human, and puts every reply in one inbox sorted by who is actually ready to buy. I run my own pipeline on it every day. If it works for me, it will work for you.',
  ],
  email: SITE.email,
} as const

/* -------------------------------------------------------------------- FAQ */

export interface Faq {
  q: string
  a: string
}

export const FAQS: Faq[] = [
  {
    q: 'What is OutreachHalo?',
    a: 'An AI sales agent you hire. Tell it who to target and what you sell, and it finds matching people on LinkedIn every day, scores them against your ideal customer, writes a personal message for each one, and sends it from your own accounts. It also writes and posts LinkedIn content aimed at those same buyers, so people come to you as well — and everyone who engages becomes a scored lead.',
  },
  {
    q: 'Does it send the messages for me?',
    a: 'Yes. Connect your own LinkedIn and email, and the agent writes a personalised message for every prospect and sends it on a human-paced schedule you control. You can approve each one first if you would rather ease in.',
  },
  {
    q: 'Does it write the LinkedIn posts too?',
    a: 'Yes, in your own voice. Paste one post you actually wrote and it matches your rhythm and vocabulary instead of producing house-style AI copy, images included, on a cadence you set. The point is not vanity metrics: anyone who reacts or comments and fits your ideal customer becomes a lead, and their first message references the exact post they engaged with. Content is optional — your agent finds and contacts matching people from your LinkedIn every day whether or not you ever publish a post. Pro includes 35 posts a month, Growth 100.',
  },
  {
    q: 'Can it reply and book meetings on its own?',
    a: 'Yes, with Autopilot. When an interested prospect replies, the agent writes and sends the next message toward your goal and shares your booking link when they are ready. It stops on “not interested” and hands the conversation over whenever you want it.',
  },
  {
    q: 'Is my account safe when sending messages?',
    a: 'We send from your real profile through an official integration, cap each account at a conservative daily limit, and pace sends across the working hours you set. You can disconnect in one click at any time.',
  },
  {
    q: 'How does pricing work?',
    a: 'Pro is a 7-day free trial, then $59 a month, which includes 2 AI agents, up to 2,000 prospects a month, 2 senders, 35 LinkedIn posts, and every core feature. Growth is $100 a month and adds more of everything: 4 agents, 4,000 prospects, 4 senders and 100 posts.',
  },
  {
    q: 'Where do the prospects come from? Do I need Sales Navigator?',
    a: 'Straight from your own LinkedIn. Connect once and the agent searches it for people who match your ideal customer, so there is no list to buy and no stale database. Sales Navigator gives you more reach but is not required.',
  },
  {
    q: 'What happens when I hit my monthly limit?',
    a: 'Everything pauses gracefully. You will not get surprise overage charges. Upgrade in two clicks if you need more, or wait for your limits to reset — which happens on your own billing date rather than the 1st of the month.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Two clicks in the billing page. No retention calls. Cancel before your trial ends and you will not be charged.',
  },
]

/* ---------------------------------------------------------------- Final CTA */

export const FINAL_CTA = {
  headline: 'Your next 10 customers are already out there.',
  body: 'Start your 7-day free trial. Cancel anytime. Your agent starts finding buyers and posting for you the second you do.',
  cta: 'Start free trial',
} as const

export const ANNOUNCEMENT = {
  emoji: '🎉',
  text: 'Limited offer: 34% OFF',
  href: '/#pricing',
  /** Countdown window in hours, seeded into a cookie on first visit. */
  windowHours: 19,
} as const
