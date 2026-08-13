'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Search,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { addToSequenceAction, prospectFeedbackAction } from '@/app/actions/app'
import { cn, formatNumber, relativeTime } from '@/lib/utils'
import type { IntentLevel, Message, Paginated, Prospect, Sequence, SequenceStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/misc'
import { ChipSelect } from '@/components/ui/tag-input'
import { PersonAvatar } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  ChannelIcon,
  FitScore,
  FitScoreDial,
  IntentChip,
  SequenceStatusBadge,
  SignalChip,
} from '@/components/product/atoms'
import { EmptyState } from '@/components/app/page-header'

const INTENTS: IntentLevel[] = ['hot', 'warm', 'cold']

const SEQ_STATUSES: { value: SequenceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Any status' },
  { value: 'not_started', label: 'Not started' },
  { value: 'in_sequence', label: 'In sequence' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
]

const SOURCES = [
  { value: 'all', label: 'Any source' },
  { value: 'linkedin_search', label: 'LinkedIn search' },
  { value: 'content_engagement', label: 'Content engagement' },
]

interface ProspectDetail {
  prospect: Prospect
  messages: Message[]
  sequence: Sequence | null
  enrollment: { current_step: number; status: string } | null
  feedback: { is_good_fit: boolean } | null
}

export function ProspectsView({
  page,
  signalOptions,
  sequences,
}: {
  page: Paginated<Prospect>
  signalOptions: string[]
  sequences: Sequence[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [pending, startTransition] = React.useTransition()
  const [showFilters, setShowFilters] = React.useState(false)
  const [search, setSearch] = React.useState(searchParams.get('search') ?? '')

  const fitMin = Number(searchParams.get('fit_min') ?? 0)
  const fitMax = Number(searchParams.get('fit_max') ?? 100)
  const intents = searchParams.getAll('intent')
  const signals = searchParams.getAll('signal')
  const seqStatus = searchParams.get('seq_status') ?? 'all'
  const source = searchParams.get('source') ?? 'all'

  const [fitRange, setFitRange] = React.useState<[number, number]>([fitMin, fitMax])

  const activeFilters =
    (fitMin > 0 || fitMax < 100 ? 1 : 0) +
    intents.length +
    signals.length +
    (seqStatus !== 'all' ? 1 : 0) +
    (source !== 'all' ? 1 : 0)

  /** All filter state lives in the URL so it survives refresh and is shareable. */
  const setParams = React.useCallback(
    (mutate: (params: URLSearchParams) => void, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      if (resetPage) params.delete('page')
      startTransition(() => router.replace(`${pathname}?${params.toString()}`, { scroll: false }))
    },
    [pathname, router, searchParams]
  )

  // Debounce the search box so typing does not fire a request per keystroke.
  React.useEffect(() => {
    const current = searchParams.get('search') ?? ''
    if (search === current) return
    const id = window.setTimeout(() => {
      setParams((params) => {
        if (search) params.set('search', search)
        else params.delete('search')
      })
    }, 350)
    return () => window.clearTimeout(id)
  }, [search, searchParams, setParams])

  function toggleMulti(key: 'intent' | 'signal', values: string[]) {
    setParams((params) => {
      params.delete(key)
      values.forEach((v) => params.append(key, v))
    })
  }

  function clearFilters() {
    setSearch('')
    startTransition(() => router.replace(pathname, { scroll: false }))
  }

  /* --------------------------------------------------------- Drawer */

  const openId = searchParams.get('open')
  const [detail, setDetail] = React.useState<ProspectDetail | null>(null)
  const [detailLoading, setDetailLoading] = React.useState(false)
  const [selectedSequence, setSelectedSequence] = React.useState<string>('')

  React.useEffect(() => {
    if (!openId) {
      setDetail(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    fetch(`/api/app/prospects/${openId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .finally(() => !cancelled && setDetailLoading(false))
    return () => {
      cancelled = true
    }
  }, [openId])

  function openProspect(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('open', id)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function closeDrawer() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('open')
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  async function submitFeedback(id: string, isGoodFit: boolean) {
    const result = await prospectFeedbackAction(id, isGoodFit)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success(isGoodFit ? 'Marked as a good fit — scoring updated' : 'Marked as a bad fit — scoring updated')
    setDetail((prev) => (prev ? { ...prev, feedback: { is_good_fit: isGoodFit } } : prev))
    router.refresh()
  }

  async function enroll(id: string) {
    const result = await addToSequenceAction(id, selectedSequence)
    if (!result.ok) {
      toast.error(result.error)
      return
    }
    toast.success('Added to sequence')
    setSelectedSequence('')
    router.refresh()
  }

  function goToPage(next: number) {
    setParams((params) => params.set('page', String(next)), false)
  }

  return (
    <>
      {/* Filter bar ----------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, company or title…"
              className="pl-9"
            />
          </div>

          <Button
            variant={showFilters ? 'default' : 'secondary'}
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
          >
            <Filter />
            Filters
            {activeFilters > 0 && (
              <span className="rounded-full bg-primary-foreground/20 px-1.5 text-[10px] font-semibold">
                {activeFilters}
              </span>
            )}
          </Button>

          {activeFilters > 0 && (
            <Button variant="ghost" onClick={clearFilters}>
              <X /> Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid animate-fade-up gap-5 rounded-2xl border border-border bg-card/60 p-5 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-baseline justify-between">
                <Label>Fit score</Label>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {fitRange[0]}–{fitRange[1]}
                </span>
              </div>
              <Slider
                value={fitRange}
                min={0}
                max={100}
                step={1}
                onValueChange={(value) => setFitRange([value[0], value[1]] as [number, number])}
                onValueCommit={(value) =>
                  setParams((params) => {
                    params.set('fit_min', String(value[0]))
                    params.set('fit_max', String(value[1]))
                  })
                }
              />
            </div>

            <div className="space-y-2.5">
              <Label>Intent</Label>
              <ChipSelect
                options={INTENTS}
                value={intents}
                onChange={(next) => toggleMulti('intent', next)}
              />
            </div>

            <div className="space-y-2.5 lg:col-span-2">
              <Label>Signals</Label>
              <ChipSelect options={signalOptions} value={signals} onChange={(next) => toggleMulti('signal', next)} />
            </div>

            <div className="space-y-2">
              <Label>Sequence status</Label>
              <Select
                value={seqStatus}
                onValueChange={(value) =>
                  setParams((params) => (value === 'all' ? params.delete('seq_status') : params.set('seq_status', value)))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEQ_STATUSES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={source}
                onValueChange={(value) =>
                  setParams((params) => (value === 'all' ? params.delete('source') : params.set('source', value)))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Table ----------------------------------------------------- */}
      <div className={cn('mt-6 rounded-2xl border border-border bg-card/60 transition-opacity', pending && 'opacity-60')}>
        {page.items.length === 0 ? (
          <EmptyState
            icon={<Search className="size-5" />}
            title="No prospects match those filters"
            description="Loosen the fit score range or clear a couple of signals — the agent adds new matches every morning."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Prospect</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead>Fit</TableHead>
                <TableHead className="hidden sm:table-cell">Intent</TableHead>
                <TableHead className="hidden lg:table-cell">Signals</TableHead>
                <TableHead className="hidden xl:table-cell">Sequence</TableHead>
                <TableHead className="hidden xl:table-cell">Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {page.items.map((prospect) => (
                <TableRow
                  key={prospect.id}
                  className="cursor-pointer"
                  onClick={() => openProspect(prospect.id)}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openProspect(prospect.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <PersonAvatar name={prospect.full_name} className="size-9" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{prospect.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{prospect.title}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="truncate text-sm">{prospect.company}</p>
                    <p className="truncate text-xs text-muted-foreground">{prospect.location}</p>
                  </TableCell>
                  <TableCell>
                    <FitScore score={prospect.fit_score} />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <IntentChip level={prospect.intent_level} />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex max-w-[16rem] flex-wrap gap-1">
                      {prospect.signals.slice(0, 2).map((signal) => (
                        <SignalChip key={signal} label={signal} />
                      ))}
                      {prospect.signals.length > 2 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">
                              +{prospect.signals.length - 2}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>{prospect.signals.slice(2).join(' · ')}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <SequenceStatusBadge status={prospect.sequence_status} />
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground xl:table-cell">
                    {relativeTime(prospect.last_activity_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination ------------------------------------------------ */}
      {page.total > 0 && (
        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing {(page.page - 1) * page.page_size + 1}–{Math.min(page.page * page.page_size, page.total)} of{' '}
            {formatNumber(page.total)}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page.page <= 1}
              onClick={() => goToPage(page.page - 1)}
            >
              <ChevronLeft /> Previous
            </Button>
            <span className="text-xs tabular-nums text-muted-foreground">
              {page.page} / {page.total_pages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page.page >= page.total_pages}
              onClick={() => goToPage(page.page + 1)}
            >
              Next <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      {/* Detail drawer --------------------------------------------- */}
      <Sheet open={Boolean(openId)} onOpenChange={(open) => !open && closeDrawer()}>
        <SheetContent side="right">
          {detailLoading || !detail ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle className="sr-only">{detail.prospect.full_name}</SheetTitle>
                <div className="flex items-start gap-4">
                  <FitScoreDial score={detail.prospect.fit_score} intent={detail.prospect.intent_level} size={72} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold">{detail.prospect.full_name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {detail.prospect.title} · {detail.prospect.company}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {detail.prospect.location} · {detail.prospect.company_size} employees · {detail.prospect.industry}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <IntentChip level={detail.prospect.intent_level} />
                      <SequenceStatusBadge status={detail.prospect.sequence_status} />
                      {detail.prospect.linkedin_url && (
                        <a
                          href={detail.prospect.linkedin_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          LinkedIn <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 p-6">
                {/* Why now */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Why now</h3>
                  <ul className="mt-3 space-y-2">
                    {detail.prospect.signals.map((signal) => (
                      <li
                        key={signal}
                        className="flex items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm"
                      >
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        {signal}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Feedback */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Teach the scoring
                  </h3>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant={detail.feedback?.is_good_fit === true ? 'default' : 'secondary'}
                      size="sm"
                      className="flex-1"
                      onClick={() => submitFeedback(detail.prospect.id, true)}
                    >
                      <ThumbsUp /> Good fit
                    </Button>
                    <Button
                      variant={detail.feedback?.is_good_fit === false ? 'destructive' : 'secondary'}
                      size="sm"
                      className="flex-1"
                      onClick={() => submitFeedback(detail.prospect.id, false)}
                    >
                      <ThumbsDown /> Bad fit
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Feedback re-weights this workspace’s scoring — the score above moves immediately.
                  </p>
                </section>

                {/* Sequence */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sequence</h3>
                  {detail.sequence ? (
                    <div className="mt-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                      <p className="text-sm font-medium">{detail.sequence.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        Step {detail.enrollment?.current_step ?? 1} of {detail.sequence.steps.length} ·{' '}
                        {detail.enrollment?.status}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Select value={selectedSequence} onValueChange={setSelectedSequence}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Choose a sequence" />
                        </SelectTrigger>
                        <SelectContent>
                          {sequences.map((sequence) => (
                            <SelectItem key={sequence.id} value={sequence.id}>
                              {sequence.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => enroll(detail.prospect.id)} disabled={!selectedSequence}>
                        Add
                      </Button>
                    </div>
                  )}
                </section>

                {/* History */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message history</h3>
                  {detail.messages.length === 0 ? (
                    <p className="mt-3 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                      Nothing sent yet.
                    </p>
                  ) : (
                    <ol className="mt-3 space-y-3">
                      {detail.messages.map((message) => (
                        <li
                          key={message.id}
                          className={cn(
                            'rounded-xl border px-3.5 py-3',
                            message.direction === 'outbound'
                              ? 'border-primary/20 bg-primary/[0.06]'
                              : 'border-border bg-secondary/40'
                          )}
                        >
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <ChannelIcon channel={message.channel} />
                            <span>{message.direction === 'outbound' ? 'You' : detail.prospect.full_name}</span>
                            <span>·</span>
                            <span>{relativeTime(message.sent_at)}</span>
                            {message.ai_generated && <span className="text-primary">· AI</span>}
                          </div>
                          <p className="mt-2 text-sm leading-relaxed text-foreground/85">{message.body}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
