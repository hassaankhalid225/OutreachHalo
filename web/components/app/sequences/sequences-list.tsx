'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Plus, Send } from 'lucide-react'
import { toast } from 'sonner'

import { createSequenceAction, updateSequenceAction } from '@/app/actions/app'
import { formatDate } from '@/lib/utils'
import type { Sequence } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ChannelIcon } from '@/components/product/atoms'
import { EmptyState } from '@/components/app/page-header'

const APPROVAL_LABEL: Record<string, string> = {
  approve_first: 'Approve first message',
  approve_all: 'Approve every message',
  autopilot: 'Full autopilot',
}

export function NewSequenceButton() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  async function create() {
    setBusy(true)
    const result = await createSequenceAction(name)
    setBusy(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setOpen(false)
    setName('')
    toast.success('Sequence created')
    if (result.data?.id) router.push(`/app/sequences/${result.data.id}`)
    else router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus /> New sequence
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New sequence</DialogTitle>
            <DialogDescription>
              Name it after the trigger, not the channel — “Hiring signal, founders” beats “LinkedIn campaign 3”.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="sequence-name">Sequence name</Label>
            <Input
              id="sequence-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder="Hot signal — same day outreach"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={create} loading={busy}>
              Create and open builder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function SequencesList({ sequences }: { sequences: Sequence[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = React.useState<string | null>(null)

  async function toggleStatus(sequence: Sequence, active: boolean) {
    setPendingId(sequence.id)
    await updateSequenceAction(sequence.id, { status: active ? 'active' : 'paused' })
    setPendingId(null)
    toast.success(active ? `“${sequence.name}” is running` : `“${sequence.name}” paused`)
    router.refresh()
  }

  if (sequences.length === 0) {
    return (
      <EmptyState
        icon={<Send className="size-5" />}
        title="No sequences yet"
        description="A sequence is a set of timed steps across LinkedIn and email. Four touches over a week is a good starting shape."
        action={<NewSequenceButton />}
      />
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sequences.map((sequence) => (
        <div
          key={sequence.id}
          className="flex flex-col rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-border/70"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Link href={`/app/sequences/${sequence.id}`} className="text-base font-semibold hover:text-primary">
                {sequence.name}
              </Link>
              {sequence.description && (
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sequence.description}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground">{sequence.status === 'active' ? 'Live' : 'Paused'}</span>
              <Switch
                checked={sequence.status === 'active'}
                disabled={pendingId === sequence.id}
                onCheckedChange={(checked) => toggleStatus(sequence, checked)}
                aria-label={`Toggle ${sequence.name}`}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {sequence.steps.map((step, i) => (
              <React.Fragment key={step.id}>
                {i > 0 && <span className="text-[10px] text-muted-foreground">→</span>}
                <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground">
                  <ChannelIcon channel={step.channel} />
                  Day {sequence.steps.slice(0, i + 1).reduce((sum, s) => sum + s.delay_days, 0)}
                </span>
              </React.Fragment>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4">
            <div>
              <p className="text-lg font-semibold tabular-nums">{sequence.enrolled_count}</p>
              <p className="text-[11px] text-muted-foreground">Enrolled</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums text-positive">{sequence.reply_rate}%</p>
              <p className="text-[11px] text-muted-foreground">Reply rate</p>
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums">{sequence.meetings_booked}</p>
              <p className="text-[11px] text-muted-foreground">Meetings</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <Badge variant="secondary">{APPROVAL_LABEL[sequence.approval_mode]}</Badge>
            <span className="text-[11px] text-muted-foreground">Created {formatDate(sequence.created_at)}</span>
          </div>

          <Button asChild variant="secondary" size="sm" className="mt-4 w-full">
            <Link href={`/app/sequences/${sequence.id}`}>
              Open builder <ArrowRight />
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}
