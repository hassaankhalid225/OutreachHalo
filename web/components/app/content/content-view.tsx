'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Info,
  List,
  MessageSquare,
  Plus,
  Sparkles,
  ThumbsUp,
  Trash2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  deletePostAction,
  generatePostAction,
  savePostAction,
  saveVoiceSampleAction,
  updatePostAction,
} from '@/app/actions/app'
import { cn, formatDate, truncate } from '@/lib/utils'
import type { ContentPost } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/app/page-header'

const STATUS_VARIANT = {
  posted: 'positive',
  scheduled: 'default',
  draft: 'secondary',
} as const

/* ------------------------------------------------------------ Calendar */

function MonthCalendar({ posts, onOpen }: { posts: ContentPost[]; onOpen: (post: ContentPost) => void }) {
  const [cursor, setCursor] = React.useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7 // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const byDay = new Map<number, ContentPost[]>()
  posts.forEach((post) => {
    const stamp = post.posted_at ?? post.scheduled_at
    if (!stamp) return
    const date = new Date(stamp)
    if (date.getFullYear() !== year || date.getMonth() !== month) return
    const day = date.getDate()
    byDay.set(day, [...(byDay.get(day) ?? []), post])
  })

  const cells = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="rounded-2xl border border-border bg-card/60">
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">
          {cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous month">
            <ChevronLeft />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next month">
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="px-2 py-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          const dayPosts = day ? (byDay.get(day) ?? []) : []
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

          return (
            <div
              key={i}
              className={cn(
                'min-h-[5.5rem] border-b border-r border-border p-1.5 last:border-r-0',
                i % 7 === 6 && 'border-r-0',
                !day && 'bg-secondary/20'
              )}
            >
              {day && (
                <>
                  <span
                    className={cn(
                      'inline-flex size-5 items-center justify-center rounded-full text-[11px] tabular-nums',
                      isToday ? 'bg-primary font-semibold text-primary-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {day}
                  </span>
                  <ul className="mt-1 space-y-1">
                    {dayPosts.map((post) => (
                      <li key={post.id}>
                        <button
                          type="button"
                          onClick={() => onOpen(post)}
                          className={cn(
                            'w-full truncate rounded-md px-1.5 py-1 text-left text-[10px] leading-tight transition-colors',
                            post.status === 'posted'
                              ? 'bg-positive/15 text-positive hover:bg-positive/25'
                              : 'bg-primary/15 text-primary hover:bg-primary/25'
                          )}
                        >
                          {truncate(post.body_text.split('\n')[0], 28)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------- Composer */

function Composer({
  open,
  onOpenChange,
  hasVoiceSample,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasVoiceSample: boolean
  editing: ContentPost | null
}) {
  const router = useRouter()
  const [voiceSample, setVoiceSample] = React.useState('')
  const [savingVoice, setSavingVoice] = React.useState(false)
  const [voiceSaved, setVoiceSaved] = React.useState(hasVoiceSample)

  const [brief, setBrief] = React.useState('')
  const [body, setBody] = React.useState(editing?.body_text ?? '')
  const [scheduledAt, setScheduledAt] = React.useState(
    editing?.scheduled_at ? new Date(editing.scheduled_at).toISOString().slice(0, 16) : ''
  )
  const [generating, setGenerating] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [note, setNote] = React.useState<string | null>(null)

  React.useEffect(() => {
    setBody(editing?.body_text ?? '')
    setScheduledAt(editing?.scheduled_at ? new Date(editing.scheduled_at).toISOString().slice(0, 16) : '')
  }, [editing])

  React.useEffect(() => setVoiceSaved(hasVoiceSample), [hasVoiceSample])

  async function submitVoice() {
    setSavingVoice(true)
    const result = await saveVoiceSampleAction(voiceSample)
    setSavingVoice(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setVoiceSaved(true)
    toast.success('Voice sample saved — drafts will match how you write')
    router.refresh()
  }

  async function generate() {
    setGenerating(true)
    const result = await generatePostAction(brief)
    setGenerating(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setBody(result.data.text)
    setNote(result.data.note)
  }

  async function save(status: ContentPost['status']) {
    setSaving(true)
    const result = editing
      ? await updatePostAction(editing.id, {
          body_text: body,
          status,
          scheduled_at: status === 'scheduled' ? new Date(scheduledAt).toISOString() : null,
        })
      : await savePostAction(body, status, status === 'scheduled' ? new Date(scheduledAt).toISOString() : null)
    setSaving(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    onOpenChange(false)
    setBrief('')
    setBody('')
    toast.success(status === 'posted' ? 'Posted' : status === 'scheduled' ? 'Scheduled' : 'Draft saved')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit post' : 'New LinkedIn post'}</DialogTitle>
          <DialogDescription>
            {voiceSaved
              ? 'Drafts are matched to the writing sample you saved.'
              : 'First, paste one post you actually wrote. It is what makes the drafts sound like you.'}
          </DialogDescription>
        </DialogHeader>

        {!voiceSaved ? (
          <div className="space-y-3">
            <Label htmlFor="voice">A post you wrote</Label>
            <Textarea
              id="voice"
              value={voiceSample}
              onChange={(e) => setVoiceSample(e.target.value)}
              rows={7}
              placeholder="Paste 100–200 words of something you actually published. Rhythm, sentence length and vocabulary all get matched from this."
            />
            <p className="text-xs text-muted-foreground">{voiceSample.length} characters · stored once, reused forever</p>
            <Button onClick={submitVoice} loading={savingVoice} className="w-full">
              Save my voice sample
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {!editing && (
              <div className="space-y-2">
                <Label htmlFor="brief">What should the post be about?</Label>
                <div className="flex gap-2">
                  <Input
                    id="brief"
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && generate()}
                    placeholder="Why our reply rate tripled when we changed the first line"
                  />
                  <Button onClick={generate} loading={generating}>
                    {!generating && <Sparkles />}
                    Generate
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="post-body">Post</Label>
              <Textarea
                id="post-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Your post…"
              />
              <p className={cn('text-right text-xs', body.length > 3000 ? 'text-destructive' : 'text-muted-foreground')}>
                {body.length} / 3,000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule for</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>

            {note && (
              <p className="flex items-start gap-2 rounded-xl border border-warm/25 bg-warm/[0.06] px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0 text-warm" />
                {note}
              </p>
            )}
          </div>
        )}

        {voiceSaved && (
          <DialogFooter>
            <Button variant="ghost" onClick={() => save('draft')} loading={saving} disabled={!body.trim()}>
              Save draft
            </Button>
            <Button
              variant="secondary"
              onClick={() => save('scheduled')}
              loading={saving}
              disabled={!body.trim() || !scheduledAt}
            >
              Schedule
            </Button>
            <Button onClick={() => save('posted')} loading={saving} disabled={!body.trim()}>
              Post now
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------------------------------------- Container */

export function ContentView({ posts, hasVoiceSample }: { posts: ContentPost[]; hasVoiceSample: boolean }) {
  const router = useRouter()
  const [composerOpen, setComposerOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ContentPost | null>(null)

  function openNew() {
    setEditing(null)
    setComposerOpen(true)
  }

  function openExisting(post: ContentPost) {
    setEditing(post)
    setComposerOpen(true)
  }

  async function remove(id: string) {
    await deletePostAction(id)
    toast.success('Post deleted')
    router.refresh()
  }

  return (
    <>
      <Tabs defaultValue="calendar">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList>
            <TabsTrigger value="calendar">
              <CalendarDays /> Calendar
            </TabsTrigger>
            <TabsTrigger value="list">
              <List /> List
            </TabsTrigger>
          </TabsList>
          <Button onClick={openNew}>
            <Plus /> New post
          </Button>
        </div>

        <TabsContent value="calendar" className="mt-6">
          <MonthCalendar posts={posts} onOpen={openExisting} />
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          {posts.length === 0 ? (
            <EmptyState
              icon={<Sparkles className="size-5" />}
              title="No posts yet"
              description="Paste one post you wrote and the agent will match your voice from then on."
              action={<Button onClick={openNew}>Write my first post</Button>}
            />
          ) : (
            <div className="rounded-2xl border border-border bg-card/60">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Post</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead className="hidden lg:table-cell">Engagement</TableHead>
                    <TableHead className="hidden lg:table-cell">Leads</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="max-w-sm">
                        <button
                          type="button"
                          onClick={() => openExisting(post)}
                          className="truncate text-left text-sm hover:text-primary"
                        >
                          {truncate(post.body_text.split('\n')[0], 70)}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[post.status]}>{post.status}</Badge>
                      </TableCell>
                      <TableCell className="hidden whitespace-nowrap text-xs text-muted-foreground md:table-cell">
                        {post.posted_at
                          ? formatDate(post.posted_at)
                          : post.scheduled_at
                            ? formatDate(post.scheduled_at)
                            : '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {post.status === 'posted' ? (
                          <span className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="size-3" /> {post.reactions_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="size-3" /> {post.comments_count}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {post.leads_generated_count > 0 ? (
                          <Link
                            href="/app/prospects?source=content_engagement"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                          >
                            <Users className="size-3" />
                            {post.leads_generated_count} became leads
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(post.id)}
                          aria-label="Delete post"
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Composer
        open={composerOpen}
        onOpenChange={setComposerOpen}
        hasVoiceSample={hasVoiceSample}
        editing={editing}
      />
    </>
  )
}
