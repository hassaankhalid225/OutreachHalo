import { SITE } from './site'

export type PlanId = 'pro' | 'growth' | 'custom'

export interface PlanLimits {
  prospects: number
  posts: number
  senders: number
  agents: number
  seats: number
}

export interface PlanDef {
  id: PlanId
  name: string
  /** In whole dollars, monthly. */
  listPrice: number | null
  price: number | null
  blurb: string
  cta: string
  ctaHref: string
  highlight?: boolean
  ribbon?: string
  inheritsFrom?: string
  features: string[]
  limits: PlanLimits
}

/** `Infinity` limits render as "Unlimited" and never gate anything. */
export const PLANS: PlanDef[] = [
  {
    id: 'pro',
    name: 'Pro',
    listPrice: 89,
    price: 59,
    blurb:
      'Your AI sales agent, both directions. It finds and contacts your buyers, and turns your posts into warm inbound.',
    cta: 'Start free trial',
    ctaHref: '/sign-up?plan=pro',
    features: [
      'Up to 2,000 ideal prospects discovered / month',
      'LinkedIn + email sending, 2 senders included',
      '2 AI sales agents prospecting 24/7',
      'Warm leads sourced automatically',
      'Smart lead scoring (18 signals)',
      'Email waterfall enrichment (25+ data providers)',
      '35 LinkedIn posts / month',
      'Unified intent inbox',
      'AI copilot mode',
      'API, MCP and CSV export',
      'Live chat support',
    ],
    limits: { prospects: 2000, posts: 35, senders: 2, agents: 2, seats: 1 },
  },
  {
    id: 'growth',
    name: 'Growth',
    listPrice: 149,
    price: 100,
    blurb:
      'For founders going all in. Double the agents, prospects and senders, plus a shared workspace for your team.',
    cta: 'Start free trial',
    ctaHref: '/sign-up?plan=growth',
    highlight: true,
    ribbon: 'Best value',
    inheritsFrom: 'Pro',
    features: [
      'Up to 4,000 ideal prospects discovered / month',
      'LinkedIn + email sending, 4 senders included',
      '4 AI sales agents prospecting 24/7',
      '100 LinkedIn posts / month',
      'Shared team workspace',
      'Priority live chat support',
    ],
    limits: { prospects: 4000, posts: 100, senders: 4, agents: 4, seats: 5 },
  },
  {
    id: 'custom',
    name: 'Custom',
    listPrice: null,
    price: null,
    blurb:
      'For sales teams and agencies at scale. Volume, senders and seats sized to you, plus a success manager.',
    cta: 'Talk with us',
    ctaHref: SITE.bookingUrl,
    inheritsFrom: 'Growth',
    features: [
      'Unlimited team members',
      'Custom agent count',
      'Custom prospect volume',
      'More sending accounts',
      'Dedicated success manager',
      'Priority support + onboarding',
    ],
    limits: {
      prospects: Number.POSITIVE_INFINITY,
      posts: Number.POSITIVE_INFINITY,
      senders: Number.POSITIVE_INFINITY,
      agents: Number.POSITIVE_INFINITY,
      seats: Number.POSITIVE_INFINITY,
    },
  },
]

export const PRICING_SECTION = {
  eyebrow: 'Pricing',
  headline: 'Pick the plan that grows with you.',
  body: 'A human SDR costs $5,000 a month. Your AI agent starts at $59, includes outreach and content, works every day, and the first 7 days are free. It only takes 10 minutes to set up.',
  smallPrint:
    '7-day free trial. Your agents start working right away. Cancel anytime before the trial ends and you will not be charged.',
} as const

/** Trial orgs get Pro-level capability so the product is usable before payment. */
export const TRIAL_LIMITS: PlanLimits = PLANS[0].limits

export function limitsForPlan(plan: string | null | undefined): PlanLimits {
  const found = PLANS.find((p) => p.id === plan)
  return found?.limits ?? TRIAL_LIMITS
}

export function planLabel(plan: string | null | undefined): string {
  if (plan === 'trial') return 'Pro trial'
  return PLANS.find((p) => p.id === plan)?.name ?? 'Pro trial'
}

export function formatLimit(value: number): string {
  return Number.isFinite(value) ? new Intl.NumberFormat('en-US').format(value) : 'Unlimited'
}

/** Feature matrix used by /pricing and the in-app upgrade modal. */
export const PLAN_MATRIX: { label: string; values: [string, string, string] }[] = [
  { label: 'Prospects discovered / month', values: ['2,000', '4,000', 'Custom'] },
  { label: 'AI sales agents', values: ['2', '4', 'Custom'] },
  { label: 'Sending accounts', values: ['2', '4', 'Custom'] },
  { label: 'LinkedIn posts / month', values: ['35', '100', 'Custom'] },
  { label: 'Team seats', values: ['1', '5', 'Unlimited'] },
  { label: 'Smart lead scoring (18 signals)', values: ['Included', 'Included', 'Included'] },
  { label: 'Email waterfall enrichment', values: ['Included', 'Included', 'Included'] },
  { label: 'Unified intent inbox', values: ['Included', 'Included', 'Included'] },
  { label: 'Autopilot replies + booking', values: ['Included', 'Included', 'Included'] },
  { label: 'API, MCP and CSV export', values: ['Included', 'Included', 'Included'] },
  { label: 'Shared team workspace', values: ['—', 'Included', 'Included'] },
  { label: 'Dedicated success manager', values: ['—', '—', 'Included'] },
]
