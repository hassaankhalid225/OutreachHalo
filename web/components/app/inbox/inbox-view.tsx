'use client'

import * as React from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CalendarCheck, Inbox, Link2, Search, Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import {
  generateReplyAction,
  markReadAction,
  sendReplyAction,
  setIntentTagAction,
  toggleAutopilotAction,
} from '@/app/actions/app'
import { cn, relativeTime, truncate } from '@/lib/utils'
import type { Channel, Conversation, IntentTag, Message, Prospect } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/misc'
import { PersonAvatar } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChannelIcon, FitScore, INTENT_TAG_LABEL, IntentTagChip, SignalChip } from '@/components/product/atoms'
import { EmptyState } from '@/components/app/page-header'

const INTENT_FILTERS: { value: IntentTag | 'all'; label: string }[] = [
  { value: 'all', label: 'All replies' },
  { value: 'interested', label: 'Interested' },
  { value: 'question', label: 'Question' },
  { value: 'not_now', label: 'Not now' },
  { value: 'neutral', label: 'Neutral' },
]

interface ThreadDetail {
  conversation: Conversation
  prospect: Prospect | null
  messages: Message[]
  booking_url: string | null
}

export function InboxView({ conversations }: { conversations: Conversation[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeId = searchParams.get('c') ?? conversations[0]?.id ?? null
  const intent = (searchParams.get('intent') as IntentTag | 'all') ?? 'all'
  const [search, setSearch] = React.useState(searchParams.get('search') ?? '')

  const [thread, setThread] = React.useState<ThreadDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [draft, setDraft] = React.useState('')
  const [draftIsAi, setDraftIsAi] = React.useState(false)
  const [generating, setGenerating] = React.useState(false)
  const [sending, setSending] = React.useState(false)
  const [channel, setChannel] = React.useState<Channel>('linkedin')
  const [mobileThreadOpen, setMobileThreadOpen] = React.useState(false)

  const scrollRef = React.useRef<HTMLDivElement>(null)

  const setParams = React.useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

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

  const loadThread = React.useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        const response = await fetch(`/api/app/inbox/${id}`)
        if (!response.ok) return
        const data: ThreadDetail = await response.json()
        setThread(data)
        setDraft('')
        setDraftIsAi(false)
        if (data.conversation.unread_count > 0) {
          await markReadAction(id)
          router.refresh()
        }
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  React.useEffect(() => {
    if (activeId) loadThread(activeId)
    else setThread(null)
  }, [activeId, loadThread])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread?.messages.length])

  function select(id: string) {
    setMobileThreadOpen(true)
    setParams((params) => params.set('c', id))
  }

  async function generate() {
    if (!thread) return
    setGenerating(true)
    const result = await generateReplyAction(thread.conversation.id)
    setGenerating(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setDraft(result.data.text)
    setDraftIsAi(true)
    if (result.data.note) toast.info(result.data.note)
  }

  async function send() {
    if (!thread || !draft.trim()) return
    setSending(true)
    const result = await sendReplyAction(thread.conversation.id, draft, draftIsAi, channel)
    setSending(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setDraft('')
    setDraftIsAi(false)
    await loadThread(thread.conversation.id)
    router.refresh()
    toast.success('Reply sent')
  }

  async function toggleAutopilot(enabled: boolean) {
    if (!thread) return
    setThread({ ...thread, conversation: { ...thread.conversation, autopilot_enabled: enabled } })
    await toggleAutopilotAction(thread.conversation.id, enabled)
    toast.success(enabled ? 'Autopilot on — it will answer and propose a time' : 'Autopilot off')
    router.refresh()
  }

  async function changeIntent(tag: IntentTag) {
    if (!thread) return
    setThread({ ...thread, conversation: { ...thread.conversation, intent_tag: tag } })
    await setIntentTagAction(thread.conversation.id, tag)
    router.refresh()
  }

  function shareBookingLink() {
    if (!thread?.booking_url) {
      toast.error('Add a booking link in Settings first.')
      return
    }
    const first = thread.conversation.prospect.full_name.split(' ')[0]
    setDraft(
      `${first} — here is my calendar, grab whichever slot suits you: ${thread.booking_url}\n\nI will come with a couple of specific ideas for ${thread.conversation.prospect.company ?? 'your team'} so it is useful either way.`
    )
    setDraftIsAi(false)
  }

  return (
    <div className="grid h-[calc(100dvh-8.5rem)] grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card/40 lg:h-[calc(100dvh-9.5rem)] lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      {/* List pane ------------------------------------------------- */}
      <div className={cn('flex min-h-0 flex-col border-border lg:border-r', mobileThreadOpen && 'hidden lg:flex')}>
        <div className="space-y-2.5 border-b border-border p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search replies…"
              className="h-9 pl-9"
            />
          </div>
          <Select
            value={intent}
            onValueChange={(value) =>
              setParams((params) => (value === 'all' ? params.delete('intent') : params.set('intent', value)))
            }
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTENT_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
          {conversations.length === 0 && (
            <li className="p-8">
              <p className="text-center text-sm text-muted-foreground">No conversations match that filter.</p>
            </li>
          )}
          {conversations.map((conversation) => {
            const unread = conversation.unread_count > 0
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => select(conversation.id)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors',
                    conversation.id === activeId ? 'bg-primary/[0.08]' : 'hover:bg-secondary/40'
                  )}
                >
                  <PersonAvatar name={conversation.prospect.full_name} className="size-9" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn('truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>
                        {conversation.prospect.full_name}
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {relativeTime(conversation.last_message_at)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{conversation.prospect.company}</p>
                    <p
                      className={cn(
                        'mt-1 truncate text-xs',
                        unread ? 'text-foreground/85' : 'text-muted-foreground/80'
                      )}
                    >
                      {truncate(conversation.last_message_snippet, 60)}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <IntentTagChip tag={conversation.intent_tag} />
                      {conversation.autopilot_enabled && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                          <Sparkles className="size-2.5" /> Auto
                        </span>
                      )}
                      {unread && <span className="ml-auto size-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Thread pane ------------------------------------------------ */}
      <div className={cn('flex min-h-0 flex-col', !mobileThreadOpen && 'hidden lg:flex')}>
        {!activeId || (!thread && !loading) ? (
          <div className="flex flex-1 items-center justify-center p-8">
            <EmptyState
              icon={<Inbox className="size-5" />}
              title="Pick a conversation"
              description="Replies are sorted by who is ready to buy. Start with anything tagged Interested."
            />
          </div>
        ) : loading || !thread ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-24 w-3/4" />
            <Skeleton className="ml-auto h-20 w-2/3" />
            <Skeleton className="h-16 w-3/5" />
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="border-b border-border p-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setMobileThreadOpen(false)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
                  aria-label="Back to list"
                >
                  <ArrowLeft className="size-4" />
                </button>
                <PersonAvatar name={thread.conversation.prospect.full_name} className="size-10" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{thread.conversation.prospect.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {thread.conversation.prospect.title} · {thread.conversation.prospect.company}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <FitScore score={thread.conversation.prospect.fit_score} />
                  <label className="flex items-center gap-2">
                    <span className="hidden text-xs text-muted-foreground sm:inline">Autopilot</span>
                    <Switch
                      checked={thread.conversation.autopilot_enabled}
                      onCheckedChange={toggleAutopilot}
                      aria-label="Toggle autopilot for this conversation"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Select value={thread.conversation.intent_tag} onValueChange={(v) => changeIntent(v as IntentTag)}>
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['interested', 'question', 'not_now', 'neutral'] as IntentTag[]).map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {INTENT_TAG_LABEL[tag]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {thread.conversation.prospect.signals.slice(0, 3).map((signal) => (
                  <SignalChip key={signal} label={signal} />
                ))}
              </div>
            </div>

            {/* Interested nudge */}
            {thread.conversation.intent_tag === 'interested' && !thread.conversation.meeting_booked_at && (
              <div className="flex flex-wrap items-center gap-3 border-b border-positive/20 bg-positive/[0.06] px-4 py-3">
                <CalendarCheck className="size-4 shrink-0 text-positive" />
                <p className="min-w-0 flex-1 text-xs text-foreground/85">
                  They are ready. Share your booking link while the thread is warm.
                </p>
                <Button size="sm" variant="secondary" onClick={shareBookingLink}>
                  <Link2 /> Share booking link
                </Button>
              </div>
            )}

            {thread.conversation.meeting_booked_at && (
              <div className="flex items-center gap-3 border-b border-positive/20 bg-positive/[0.06] px-4 py-3">
                <CalendarCheck className="size-4 shrink-0 text-positive" />
                <p className="text-xs text-foreground/85">
                  Meeting booked for{' '}
                  {new Date(thread.conversation.meeting_booked_at).toLocaleString('en-US', {
                    weekday: 'long',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {thread.messages.map((message) => {
                const outbound = message.direction === 'outbound'
                return (
                  <div key={message.id} className={cn('flex', outbound ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[85%] sm:max-w-[75%]', outbound && 'text-right')}>
                      <div
                        className={cn(
                          'relative whitespace-pre-wrap rounded-2xl px-4 py-3 text-left text-sm leading-relaxed',
                          outbound
                            ? 'rounded-tr-sm bg-primary/15 text-foreground'
                            : 'rounded-tl-sm bg-secondary/70 text-foreground/90'
                        )}
                      >
                        {message.subject && (
                          <p className="mb-1.5 border-b border-border/60 pb-1.5 text-xs font-medium">
                            {message.subject}
                          </p>
                        )}
                        {message.body}
                      </div>
                      <div
                        className={cn(
                          'mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground',
                          outbound && 'justify-end'
                        )}
                      >
                        <ChannelIcon channel={message.channel} />
                        <span>{relativeTime(message.sent_at)}</span>
                        {message.ai_generated && <span className="text-primary">· AI</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Composer */}
            <div className="border-t border-border p-4">
              <Textarea
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  setDraftIsAi(false)
                }}
                placeholder={`Reply to ${thread.conversation.prospect.full_name.split(' ')[0]}…`}
                rows={3}
                className="resize-none"
              />
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
                  <SelectTrigger className="h-9 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="secondary" size="sm" onClick={generate} loading={generating}>
                  {!generating && <Sparkles />}
                  Generate AI reply
                </Button>

                {draftIsAi && (
                  <span className="text-[11px] text-primary">AI draft — edit before sending</span>
                )}

                <Button size="sm" className="ml-auto" onClick={send} loading={sending} disabled={!draft.trim()}>
                  <Send /> Send
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
