import * as React from 'react'
import { Mail, Linkedin, Flame, ThermometerSun, Snowflake } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Channel, IntentLevel, IntentTag, SequenceStatus } from '@/lib/types'

/* --------------------------------------------------------------- Fit score */

export function fitTone(score: number) {
  if (score >= 80) return { text: 'text-positive', bg: 'bg-positive/12', border: 'border-positive/30', bar: 'bg-positive' }
  if (score >= 50) return { text: 'text-warm', bg: 'bg-warm/12', border: 'border-warm/30', bar: 'bg-warm' }
  return { text: 'text-muted-foreground', bg: 'bg-muted', border: 'border-border', bar: 'bg-muted-foreground/60' }
}

export function FitScore({ score, className }: { score: number; className?: string }) {
  const tone = fitTone(score)
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold tabular-nums',
        tone.border,
        tone.bg,
        tone.text,
        className
      )}
    >
      {score}
      <span className="text-[10px] font-normal opacity-70">/100</span>
    </span>
  )
}

/** The bigger radial version used in the marketing mockup and prospect drawer. */
export function FitScoreDial({ score, intent, size = 96 }: { score: number; intent: IntentLevel; size?: number }) {
  const radius = size / 2 - 6
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference
  const stroke = intent === 'hot' ? 'hsl(var(--hot))' : intent === 'warm' ? 'hsl(var(--warm))' : 'hsl(var(--cold))'

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="transition-[stroke-dasharray] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold leading-none tabular-nums">{score}</span>
        <span className="mt-0.5 text-[10px] uppercase tracking-widest" style={{ color: stroke }}>
          {intent}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Intent */

const INTENT_META: Record<IntentLevel, { label: string; className: string; Icon: React.ElementType }> = {
  hot: { label: 'HOT', className: 'border-hot/30 bg-hot/12 text-hot', Icon: Flame },
  warm: { label: 'WARM', className: 'border-warm/30 bg-warm/12 text-warm', Icon: ThermometerSun },
  cold: { label: 'COLD', className: 'border-cold/30 bg-cold/12 text-cold', Icon: Snowflake },
}

export function IntentChip({
  level,
  showIcon = true,
  className,
}: {
  level: IntentLevel
  showIcon?: boolean
  className?: string
}) {
  const meta = INTENT_META[level]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider',
        meta.className,
        className
      )}
    >
      {showIcon && <meta.Icon className="size-3" />}
      {meta.label}
    </span>
  )
}

const INTENT_TAG_META: Record<IntentTag, { label: string; className: string }> = {
  interested: { label: 'Interested', className: 'border-positive/30 bg-positive/12 text-positive' },
  question: { label: 'Question', className: 'border-cold/30 bg-cold/12 text-cold' },
  not_now: { label: 'Not now', className: 'border-warm/30 bg-warm/12 text-warm' },
  neutral: { label: 'Neutral', className: 'border-border bg-muted text-muted-foreground' },
}

export function IntentTagChip({ tag, className }: { tag: IntentTag; className?: string }) {
  const meta = INTENT_TAG_META[tag]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
        meta.className,
        className
      )}
    >
      {meta.label}
    </span>
  )
}

export const INTENT_TAG_LABEL: Record<IntentTag, string> = {
  interested: 'Interested',
  question: 'Question',
  not_now: 'Not now',
  neutral: 'Neutral',
}

/* ----------------------------------------------------------------- Signals */

export function SignalChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground',
        className
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full bg-primary" />
      {label}
    </span>
  )
}

/* ---------------------------------------------------------------- Channels */

export function ChannelIcon({ channel, className }: { channel: Channel; className?: string }) {
  return channel === 'linkedin' ? (
    <Linkedin className={cn('size-3.5 text-[#4A9EEA]', className)} aria-label="LinkedIn" />
  ) : (
    <Mail className={cn('size-3.5 text-[#E4796B]', className)} aria-label="Email" />
  )
}

/* --------------------------------------------------------- Sequence status */

const SEQ_STATUS_META: Record<SequenceStatus, { label: string; className: string }> = {
  not_started: { label: 'Not started', className: 'border-border bg-muted text-muted-foreground' },
  in_sequence: { label: 'In sequence', className: 'border-primary/30 bg-primary/12 text-primary' },
  replied: { label: 'Replied', className: 'border-positive/30 bg-positive/12 text-positive' },
  closed: { label: 'Closed', className: 'border-border bg-secondary text-muted-foreground' },
}

export function SequenceStatusBadge({ status, className }: { status: SequenceStatus; className?: string }) {
  const meta = SEQ_STATUS_META[status]
  return (
    <span
      className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium', meta.className, className)}
    >
      {meta.label}
    </span>
  )
}

/* --------------------------------------------------------------- Live dot */

export function LiveDot({ className, tone = 'positive' }: { className?: string; tone?: 'positive' | 'primary' }) {
  const color = tone === 'positive' ? 'bg-positive' : 'bg-primary'
  return (
    <span className={cn('relative flex size-2.5 shrink-0', className)}>
      <span className={cn('absolute inline-flex size-full rounded-full opacity-75 animate-pulse-ring', color)} />
      <span className={cn('relative inline-flex size-2.5 rounded-full', color)} />
    </span>
  )
}
