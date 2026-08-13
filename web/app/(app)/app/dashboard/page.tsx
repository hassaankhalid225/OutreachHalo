import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarCheck,
  Inbox,
  MessageSquare,
  Send,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'

import { getSession } from '@/lib/auth'
import { getActivityFeed, getActivitySeries, getAgents, getDashboardStats, getProspects } from '@/lib/data/repo'
import { formatNumber, relativeTime } from '@/lib/utils'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { StatCard } from '@/components/app/stat-card'
import { ActivityChart } from '@/components/app/activity-chart'
import { Button } from '@/components/ui/button'
import { PersonAvatar } from '@/components/ui/avatar'
import { FitScore, IntentChip, LiveDot } from '@/components/product/atoms'

export const metadata: Metadata = { title: 'Dashboard' }

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const session = await getSession()
  const [stats, series, feed, agents, hotProspects] = await Promise.all([
    getDashboardStats(),
    getActivitySeries(14),
    getActivityFeed(6),
    getAgents(),
    getProspects({ intent: ['hot'], page_size: 4 }),
  ])

  const firstName = (session?.profile.full_name ?? 'there').split(' ')[0]
  const activeAgents = agents.filter((a) => a.status === 'active')

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${firstName}`}
        description="Here is what your agent has done while you were away."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/app/prospects">
                <Users /> Prospects
              </Link>
            </Button>
            <Button asChild>
              <Link href="/app/inbox">
                <Inbox /> Inbox
                {stats.unread_replies > 0 && (
                  <span className="rounded-full bg-primary-foreground/20 px-1.5 text-[10px] font-semibold">
                    {stats.unread_replies}
                  </span>
                )}
              </Link>
            </Button>
          </>
        }
      />

      <PageBody className="space-y-6">
        {/* Stats ------------------------------------------------------ */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Prospects this month"
            value={formatNumber(stats.prospects_this_month)}
            hint={`${formatNumber(stats.total_prospects)} in your pipeline`}
            icon={<UserPlus className="size-4" />}
            tone="primary"
          />
          <StatCard
            label="Messages sent"
            value={formatNumber(stats.messages_sent)}
            hint="Across LinkedIn and email"
            icon={<Send className="size-4" />}
          />
          <StatCard
            label="Reply rate"
            value={`${stats.reply_rate}%`}
            hint="Unique prospects who replied"
            icon={<MessageSquare className="size-4" />}
            tone="positive"
          />
          <StatCard
            label="Meetings booked"
            value={stats.meetings_booked}
            hint="Including autopilot bookings"
            icon={<CalendarCheck className="size-4" />}
            tone="positive"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          {/* Chart --------------------------------------------------- */}
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">Outreach activity</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Messages sent and replies, last 14 days</p>
              </div>
              <div className="flex shrink-0 gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full bg-primary" /> Sent
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="size-2 rounded-full bg-positive" /> Replies
                </span>
              </div>
            </div>
            <div className="mt-5">
              <ActivityChart data={series} />
            </div>
          </div>

          {/* Agent status + feed ------------------------------------- */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <LiveDot />
                  <h2 className="text-sm font-semibold">
                    {activeAgents.length > 0 ? 'Your agent — active' : 'All agents paused'}
                  </h2>
                </div>
                <Link href="/app/agents" className="shrink-0 text-xs text-primary hover:underline">
                  Manage
                </Link>
              </div>

              <ul className="mt-4 space-y-3">
                {feed.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-2.5">
                    <span
                      className={
                        entry.actor === 'ai'
                          ? 'mt-1 flex size-5 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary'
                          : 'mt-1 flex size-5 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground'
                      }
                    >
                      {entry.actor === 'ai' ? <Sparkles className="size-3" /> : <Users className="size-3" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-foreground/85">{entry.detail}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{relativeTime(entry.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <Link
                href="/app/inbox"
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/30"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Inbox className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {stats.unread_replies} {stats.unread_replies === 1 ? 'reply needs' : 'replies need'} you
                  </p>
                  <p className="text-xs text-muted-foreground">Sorted by who is ready to buy</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>

              <Link
                href="/app/prospects?intent=hot"
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card/60 p-4 transition-colors hover:border-primary/30"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-hot/12 text-hot">
                  <Users className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{stats.hot_prospects} hot prospects waiting</p>
                  <p className="text-xs text-muted-foreground">Scored 85+ with fresh intent</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Today's queue --------------------------------------------- */}
        <div className="rounded-2xl border border-border bg-card/60">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Today’s queue</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Highest-intent prospects your agent surfaced</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href="/app/prospects">
                View all <ArrowRight />
              </Link>
            </Button>
          </div>

          <ul className="divide-y divide-border">
            {hotProspects.items.map((prospect) => (
              <li key={prospect.id}>
                <Link
                  href={`/app/prospects?open=${prospect.id}`}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-secondary/40"
                >
                  <PersonAvatar name={prospect.full_name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{prospect.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {prospect.title} · {prospect.company}
                    </p>
                  </div>
                  <div className="hidden min-w-0 flex-1 gap-1.5 lg:flex">
                    {prospect.signals.slice(0, 2).map((signal) => (
                      <span
                        key={signal}
                        className="truncate rounded-md border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                  <IntentChip level={prospect.intent_level} />
                  <FitScore score={prospect.fit_score} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PageBody>
    </>
  )
}
