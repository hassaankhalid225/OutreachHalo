'use client'

import * as React from 'react'
import { motion, useInView } from 'framer-motion'
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Globe,
  MessageSquare,
  Sparkles,
  ThumbsUp,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { PersonAvatar } from '@/components/ui/avatar'
import { ChannelIcon, FitScoreDial, IntentTagChip, LiveDot, SignalChip } from '@/components/product/atoms'
import { LinkedInGlyph } from '@/components/brand/logos'
import { MOCKUP_PROSPECTS } from '@/lib/data/fixtures'

/**
 * The five product mockups.
 *
 * These are real components rendering real seed data, not screenshots — which
 * is why the same files are re-used inside the dashboard. Change the product
 * and the marketing site changes with it.
 */

export function MockupShell({
  children,
  className,
  title,
}: {
  children: React.ReactNode
  className?: string
  title?: string
}) {
  return (
    <div className={cn('surface overflow-hidden shadow-halo', className)}>
      {title && (
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-4 py-2.5">
          <LiveDot />
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
      )}
      {children}
    </div>
  )
}

/* ============================================ 1 · Prospect discovery */

export function ProspectDiscoveryMockup({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref}>
      <MockupShell className={className}>
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <LiveDot />
            <p className="text-sm font-medium">Found 3 prospects on LinkedIn</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">just now</span>
        </div>

        <ul className="divide-y divide-border">
          {MOCKUP_PROSPECTS.map((person, i) => (
            <motion.li
              key={person.name}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.25 + i * 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 px-5 py-3.5"
            >
              <PersonAvatar name={person.name} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{person.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {person.title} · {person.company}
                </p>
              </div>
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={inView ? { scale: 1, opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.55 + i * 0.35 }}
                className="shrink-0 rounded-lg border border-positive/30 bg-positive/12 px-2 py-0.5 text-xs font-semibold text-positive"
              >
                {[96, 89, 83][i]}
              </motion.span>
            </motion.li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-2 border-t border-border bg-secondary/30 px-5 py-3">
          <span className="text-xs text-muted-foreground">Scored against your ideal customer</span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            <ThumbsUp className="size-3" /> Teach it
          </span>
        </div>
      </MockupShell>
    </div>
  )
}

/* ================================================ 2 · Intent scoring */

const WHY_NOW = ['Hiring SDRs', 'Engaged a competitor', 'Posted about outbound', 'Changed roles 12 days ago']

export function IntentScoreMockup({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref}>
      <MockupShell className={className}>
        <div className="flex items-start gap-5 p-5">
          <FitScoreDial score={92} intent="hot" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <PersonAvatar name="Sarah Jenkins" className="size-8" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Sarah Jenkins</p>
                <p className="truncate text-xs text-muted-foreground">COO · Maker Loop</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">Why now</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {WHY_NOW.map((signal, i) => (
                <motion.span
                  key={signal}
                  initial={{ opacity: 0, y: 6 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.35, delay: 0.3 + i * 0.12 }}
                >
                  <SignalChip label={signal} />
                </motion.span>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-5 mb-5 rounded-xl border border-border bg-secondary/40 p-3.5">
          <div className="flex items-start gap-2">
            <LinkedInGlyph className="mt-0.5 size-4 shrink-0 rounded" />
            <p className="text-xs italic leading-relaxed text-muted-foreground">
              “Scaling our SDR team this quarter — if you know anyone great, send them my way…”
            </p>
          </div>
          <button className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            View post <ArrowUpRight className="size-3" />
          </button>
        </div>
      </MockupShell>
    </div>
  )
}

/* ================================================ 3 · LinkedIn post */

export function LinkedInPostMockup({ className }: { className?: string }) {
  const reactors = ['Devon Wu', 'Maya Rodriguez', 'Tomas Herrera', 'Nina Kowalski']

  return (
    <MockupShell className={className}>
      <div className="p-5">
        <div className="flex items-center gap-3">
          <PersonAvatar name="Alex Morgan" className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Alex Morgan</p>
            <p className="truncate text-xs text-muted-foreground">Founder, Acme Analytics · 2h</p>
          </div>
          <LinkedInGlyph className="size-5 shrink-0 rounded" />
        </div>

        <p className="mt-4 text-sm leading-relaxed">
          Most outbound fails for one boring reason. Here is the fix we use to win new clients every week…
        </p>

        <div className="mt-4 flex items-center gap-3 border-t border-border pt-3.5">
          <div className="flex -space-x-2">
            {reactors.map((name) => (
              <PersonAvatar key={name} name={name} className="size-6 border-2 border-card" />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">9 reactions</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="size-3" />3 buying signals created
          </span>
        </div>
      </div>
    </MockupShell>
  )
}

/* ============================================= 4 · Sequence timeline */

const SEQUENCE_STEPS = [
  { day: 'Day 0', channel: 'linkedin' as const, body: 'Hey Sarah, noticed Maker Loop is scaling outbound…' },
  { day: 'Day 2', channel: 'email' as const, body: 'Quick idea on cutting list build time in half…' },
  { day: 'Day 4', channel: 'linkedin' as const, body: 'Did the connection note resonate?' },
  { day: 'Day 7', channel: 'email' as const, body: 'One more thing on outbound scaling…' },
]

export function SequenceTimelineMockup({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref}>
      <MockupShell className={className}>
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <PersonAvatar name="Sarah Jenkins" className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">Sarah Jenkins</p>
            <p className="truncate text-xs text-muted-foreground">COO · Maker Loop</p>
          </div>
          <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            In sequence
          </span>
        </div>

        <ol className="relative space-y-1 px-5 py-4">
          <span aria-hidden className="absolute bottom-8 left-[2.05rem] top-8 w-px bg-border" />
          {SEQUENCE_STEPS.map((step, i) => (
            <motion.li
              key={step.day}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.22 }}
              className="relative flex gap-3 py-2"
            >
              <span className="relative z-10 mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                <ChannelIcon channel={step.channel} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{step.day}</p>
                <p className="mt-1 rounded-xl rounded-tl-sm bg-secondary/70 px-3 py-2 text-xs leading-relaxed text-foreground/90">
                  {step.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        <p className="border-t border-border bg-secondary/30 px-5 py-3 text-xs text-muted-foreground">
          Sent from your accounts — paced safely
        </p>
      </MockupShell>
    </div>
  )
}

/* ==================================================== 5 · Inbox list */

const INBOX_ROWS = [
  { name: 'Sarah Jenkins', tag: 'interested' as const, body: 'Let’s jump on a quick call this week…' },
  { name: 'Devon Wu', tag: 'question' as const, body: 'Curious how this compares to our current setup' },
  { name: 'Maya R.', tag: 'not_now' as const, body: 'Not right now, circle back in Q2?' },
]

export function InboxPreviewMockup({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref}>
      <MockupShell className={className}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="text-sm font-medium">Inbox</p>
          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">3 new</span>
        </div>

        <ul className="divide-y divide-border">
          {INBOX_ROWS.map((row, i) => (
            <motion.li
              key={row.name}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.18 }}
              className={cn('flex items-start gap-3 px-5 py-3.5', i === 0 && 'bg-primary/[0.06]')}
            >
              <PersonAvatar name={row.name} className="size-9" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">{row.name}</p>
                  <IntentTagChip tag={row.tag} />
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{row.body}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        <div className="flex items-center gap-2 border-t border-border bg-secondary/30 px-5 py-3">
          <Sparkles className="size-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">Autopilot answered 2 and shared your booking link</span>
        </div>
      </MockupShell>
    </div>
  )
}

/* ============================================ Bonus · setup + close */

const UNDERSTOOD = [
  { label: 'What you sell', value: 'AI-powered sales outreach' },
  { label: 'Who you target', value: 'Founders and sales teams' },
  { label: 'How to pitch you', value: 'Win customers on autopilot' },
]

export function SetupMockup({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <div ref={ref}>
      <MockupShell className={className}>
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <Globe className="size-4 text-muted-foreground" />
          <span className="truncate font-mono text-xs text-muted-foreground">acme-analytics.com</span>
          <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-positive/30 bg-positive/12 px-2 py-0.5 text-[11px] font-medium text-positive">
            <CheckCircle2 className="size-3" /> Ready
          </span>
        </div>

        <div className="space-y-3 p-5">
          <p className="text-sm font-medium">Business understood</p>
          {UNDERSTOOD.map((row, i) => (
            <motion.div
              key={row.label}
              initial={{ opacity: 0, y: 8 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.28 }}
              className="rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5"
            >
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{row.label}</p>
              <p className="mt-0.5 text-sm">{row.value}</p>
            </motion.div>
          ))}
        </div>
      </MockupShell>
    </div>
  )
}

export function CloseMockup({ className }: { className?: string }) {
  return (
    <MockupShell className={className}>
      <div className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <PersonAvatar name="Sarah Jenkins" className="size-9" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium">Sarah Jenkins</p>
              <IntentTagChip tag="interested" />
            </div>
            <p className="mt-1.5 rounded-xl rounded-tl-sm bg-secondary/70 px-3 py-2 text-xs leading-relaxed">
              Let’s hop on a quick call this week, how is Thursday?
            </p>
          </div>
        </div>

        <div className="flex items-start justify-end gap-3">
          <div className="min-w-0 max-w-[80%]">
            <p className="rounded-xl rounded-tr-sm bg-primary/15 px-3 py-2 text-xs leading-relaxed text-foreground">
              Thursday works — here is my link, grab whichever slot suits.
            </p>
            <p className="mt-1 flex items-center justify-end gap-1 text-[10px] text-primary">
              <Sparkles className="size-2.5" /> sent by Autopilot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-positive/25 bg-positive/[0.08] px-3.5 py-3">
          <CalendarCheck className="size-4 shrink-0 text-positive" />
          <div className="min-w-0">
            <p className="text-xs font-medium">Thursday, 2:00 PM added to your calendar</p>
            <p className="text-[11px] text-muted-foreground">Autopilot booked the meeting</p>
          </div>
        </div>
      </div>
    </MockupShell>
  )
}

/* ==================================================== Browser chrome */

export function BrowserFrame({
  children,
  url = 'app.outreachhalo.com/dashboard',
  className,
}: {
  children: React.ReactNode
  url?: string
  className?: string
}) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-card shadow-halo', className)}>
      <div className="flex items-center gap-3 border-b border-border bg-secondary/50 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#FF5F57]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="size-2.5 rounded-full bg-[#28C840]" />
        </div>
        <div className="mx-auto flex max-w-xs flex-1 items-center justify-center gap-1.5 rounded-md bg-background/60 px-3 py-1">
          <span className="truncate font-mono text-[11px] text-muted-foreground">{url}</span>
        </div>
        <MessageSquare className="size-3.5 shrink-0 text-muted-foreground/50" aria-hidden />
      </div>
      {children}
    </div>
  )
}

/** Named lookup so content files can reference a mockup by key. */
export const MOCKUPS = {
  discovery: ProspectDiscoveryMockup,
  intent: IntentScoreMockup,
  post: LinkedInPostMockup,
  sequence: SequenceTimelineMockup,
  inbox: InboxPreviewMockup,
  setup: SetupMockup,
  close: CloseMockup,
} as const

export type MockupName = keyof typeof MOCKUPS

/**
 * Render a mockup by key.
 *
 * Server components cannot index `MOCKUPS` directly — every export of a
 * `'use client'` module reaches the server as an opaque client reference, so
 * `MOCKUPS[key]` would be undefined there. This wrapper does the lookup on the
 * client side of the boundary, where the real object exists.
 */
export function Mockup({ name, className }: { name: MockupName; className?: string }) {
  const Component = MOCKUPS[name]
  return <Component className={className} />
}
