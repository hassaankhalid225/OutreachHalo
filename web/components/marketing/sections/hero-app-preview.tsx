'use client'

import { motion } from 'framer-motion'
import { BarChart3, Inbox, LayoutDashboard, Send, Users, Zap } from 'lucide-react'

import { PersonAvatar } from '@/components/ui/avatar'
import { IntentChip, LiveDot, SignalChip } from '@/components/product/atoms'
import { Logo } from '@/components/brand/logos'

const SIDEBAR = [
  { label: 'Dashboard', Icon: LayoutDashboard, active: true },
  { label: 'Prospects', Icon: Users },
  { label: 'Sequences', Icon: Send },
  { label: 'Inbox', Icon: Inbox, badge: 3 },
  { label: 'Content', Icon: BarChart3 },
  { label: 'Agents', Icon: Zap },
]

const STATS = [
  { label: 'Prospects found', value: '340', delta: '+18%' },
  { label: 'Messages sent', value: '1,284', delta: '+9%' },
  { label: 'Reply rate', value: '11.4%', delta: '+2.6pt' },
  { label: 'Meetings booked', value: '14', delta: '+4' },
]

const CHART = [38, 62, 45, 78, 55, 30, 22, 70, 92, 61, 74, 52, 100, 68]

const QUEUE = [
  { name: 'Jordan Mitchell', title: 'Founder · Realm', score: 96, intent: 'hot' as const, signal: 'Hiring SDRs' },
  { name: 'Sarah Jenkins', title: 'COO · Maker Loop', score: 94, intent: 'hot' as const, signal: 'Engaged a competitor' },
  { name: 'Tomas Herrera', title: 'VP Sales · Kestrel Data', score: 92, intent: 'hot' as const, signal: 'Job change to VP Sales' },
]

/** A miniature, non-interactive rendering of the real dashboard. */
export function HeroAppPreview() {
  return (
    <div className="grid min-h-[22rem] grid-cols-[auto_minmax(0,1fr)] bg-background/40 text-left sm:min-h-[26rem]">
      {/* Sidebar */}
      <aside className="hidden w-44 shrink-0 flex-col gap-1 border-r border-border bg-card/50 p-3 sm:flex">
        <div className="px-1.5 pb-3">
          <Logo className="scale-90 origin-left" />
        </div>
        {SIDEBAR.map(({ label, Icon, active, badge }) => (
          <div
            key={label}
            className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs ${
              active ? 'bg-primary/15 font-medium text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
            {badge ? (
              <span className="ml-auto rounded-full bg-primary px-1.5 text-[9px] font-semibold text-primary-foreground">
                {badge}
              </span>
            ) : null}
          </div>
        ))}
      </aside>

      {/* Main */}
      <div className="min-w-0 space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Good morning, Alex</p>
            <p className="text-[11px] text-muted-foreground">Your agent has been working since 6:00 AM</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-positive/30 bg-positive/10 px-2.5 py-1 text-[10px] font-medium text-positive">
            <LiveDot />
            Agent active
          </span>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
              className="rounded-xl border border-border bg-card/70 p-3"
            >
              <p className="truncate text-[10px] text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-lg font-semibold leading-none tabular-nums">{stat.value}</p>
              <p className="mt-1.5 text-[10px] font-medium text-positive">{stat.delta}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {/* Activity chart */}
          <div className="rounded-xl border border-border bg-card/70 p-3.5">
            <p className="text-[11px] font-medium text-muted-foreground">Outreach activity · 14 days</p>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {CHART.map((height, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.6, delay: 0.9 + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/25 to-primary"
                />
              ))}
            </div>
          </div>

          {/* Today's queue */}
          <div className="rounded-xl border border-border bg-card/70 p-3.5">
            <p className="text-[11px] font-medium text-muted-foreground">Today’s queue</p>
            <ul className="mt-2.5 space-y-2.5">
              {QUEUE.map((row, i) => (
                <motion.li
                  key={row.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1.1 + i * 0.14 }}
                  className="flex items-center gap-2.5"
                >
                  <PersonAvatar name={row.name} className="size-7" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium">{row.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{row.title}</p>
                  </div>
                  <IntentChip level={row.intent} showIcon={false} />
                  <span className="shrink-0 rounded-md border border-positive/30 bg-positive/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-positive">
                    {row.score}
                  </span>
                </motion.li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
              <SignalChip label="Hiring SDRs" />
              <SignalChip label="Switched CRM" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
