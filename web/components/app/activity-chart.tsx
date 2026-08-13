'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { ActivityPoint } from '@/lib/types'

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 shadow-halo">
      <p className="text-xs font-medium">{label ? dayLabel(label) : ''}</p>
      <ul className="mt-1.5 space-y-1">
        {payload.map((entry) => (
          <li key={entry.name} className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="ml-auto font-mono tabular-nums">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(252 100% 68%)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="hsl(252 100% 68%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="repliesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(152 62% 48%)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(152 62% 48%)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 12% 16%)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={dayLabel}
            tick={{ fontSize: 11, fill: 'hsl(240 6% 62%)' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(240 6% 62%)' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
            width={44}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'hsl(240 12% 22%)' }} />

          <Area
            type="monotone"
            dataKey="sent"
            name="Messages sent"
            stroke="hsl(252 100% 68%)"
            strokeWidth={2}
            fill="url(#sentFill)"
          />
          <Area
            type="monotone"
            dataKey="replies"
            name="Replies"
            stroke="hsl(152 62% 48%)"
            strokeWidth={2}
            fill="url(#repliesFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FunnelChart({ data }: { data: { stage: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <ul className="space-y-3">
      {data.map((entry, i) => {
        const pct = (entry.value / max) * 100
        const conversion = i === 0 ? 100 : max === 0 ? 0 : Math.round((entry.value / data[0].value) * 100)

        return (
          <li key={entry.stage}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-foreground/85">{entry.stage}</span>
              <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                {entry.value} · {conversion}%
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary/50 to-primary transition-[width] duration-700"
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
