'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Eye, GripVertical, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { saveStepsAction, updateSequenceAction } from '@/app/actions/app'
import { cn } from '@/lib/utils'
import type { Channel, Prospect, Sequence, SequenceStep } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PersonAvatar } from '@/components/ui/avatar'
import { ChannelIcon } from '@/components/product/atoms'
import { FunnelChart } from '@/components/app/activity-chart'

type DraftStep = Omit<SequenceStep, 'id' | 'sequence_id'>

const APPROVAL_MODES = [
  { value: 'approve_first', label: 'Approve the first message', hint: 'You see the opener before it goes out. Follow-ups run automatically.' },
  { value: 'approve_all', label: 'Approve every message', hint: 'Nothing leaves your account until you have read it.' },
  { value: 'autopilot', label: 'Full autopilot', hint: 'The agent sends everything, including follow-ups and replies.' },
] as const

const MERGE_TAGS = ['{{first_name}}', '{{company}}', '{{signal}}', '{{title}}']

function renderPreview(template: string, prospect: Prospect | undefined) {
  const first = prospect?.full_name.split(' ')[0] ?? 'Sarah'
  return template
    .replaceAll('{{first_name}}', first)
    .replaceAll('{{company}}', prospect?.company ?? 'Maker Loop')
    .replaceAll('{{title}}', prospect?.title ?? 'COO')
    .replaceAll('{{signal}}', (prospect?.signals?.[0] ?? 'Hiring SDRs').toLowerCase())
}

export function SequenceBuilder({
  sequence,
  prospects,
  sampleProspects,
}: {
  sequence: Sequence
  prospects: Prospect[]
  sampleProspects: Prospect[]
}) {
  const router = useRouter()

  const [name, setName] = React.useState(sequence.name)
  const [approvalMode, setApprovalMode] = React.useState<string>(sequence.approval_mode)
  const [steps, setSteps] = React.useState<DraftStep[]>(
    sequence.steps.map(({ id: _id, sequence_id: _sequenceId, ...rest }) => rest)
  )
  const [previewId, setPreviewId] = React.useState(sampleProspects[0]?.id ?? '')
  const [dirty, setDirty] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  const previewProspect = sampleProspects.find((p) => p.id === previewId) ?? sampleProspects[0]

  function patchStep(index: number, patch: Partial<DraftStep>) {
    setSteps((prev) => prev.map((step, i) => (i === index ? { ...step, ...patch } : step)))
    setDirty(true)
  }

  function addStep() {
    const last = steps.at(-1)
    setSteps((prev) => [
      ...prev,
      {
        step_order: prev.length + 1,
        channel: last?.channel === 'linkedin' ? 'email' : 'linkedin',
        delay_days: prev.length === 0 ? 0 : 3,
        subject: null,
        message_template: 'Hi {{first_name}} — following up on my last note. Worth a quick look?',
        ai_personalize: true,
      },
    ])
    setDirty(true)
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index))
    setDirty(true)
  }

  function moveStep(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= steps.length) return
    setSteps((prev) => {
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    const [stepResult] = await Promise.all([
      saveStepsAction(sequence.id, steps.map((step, i) => ({ ...step, step_order: i + 1 }))),
      updateSequenceAction(sequence.id, { name, approval_mode: approvalMode }),
    ])
    setSaving(false)

    if (!stepResult.ok) {
      toast.error(stepResult.error)
      return
    }

    setDirty(false)
    toast.success('Sequence saved')
    router.refresh()
  }

  const cumulativeDay = (index: number) => steps.slice(0, index + 1).reduce((sum, s) => sum + s.delay_days, 0)

  const funnel = [
    { stage: 'Sent', value: sequence.enrolled_count },
    { stage: 'Replied', value: sequence.replied_count },
    { stage: 'Meeting booked', value: sequence.meetings_booked },
  ]

  return (
    <Tabs defaultValue="builder">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="enrolled">Enrolled ({prospects.length})</TabsTrigger>
        </TabsList>

        <Button onClick={save} loading={saving} disabled={!dirty}>
          <Save />
          {dirty ? 'Save changes' : 'Saved'}
        </Button>
      </div>

      {/* ------------------------------------------------------ Builder */}
      <TabsContent value="builder" className="mt-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <div className="space-y-2">
                <Label htmlFor="seq-name">Sequence name</Label>
                <Input
                  id="seq-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    setDirty(true)
                  }}
                />
              </div>

              <div className="mt-6 space-y-3">
                <Label>Approval mode — you choose the leash</Label>
                <RadioGroup
                  value={approvalMode}
                  onValueChange={(value) => {
                    setApprovalMode(value)
                    setDirty(true)
                  }}
                  className="gap-2"
                >
                  {APPROVAL_MODES.map((mode) => (
                    <label
                      key={mode.value}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors',
                        approvalMode === mode.value
                          ? 'border-primary/40 bg-primary/[0.07]'
                          : 'border-border hover:border-border/70'
                      )}
                    >
                      <RadioGroupItem value={mode.value} className="mt-0.5" />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium">{mode.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{mode.hint}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            {/* Steps */}
            <ol className="space-y-4">
              {steps.map((step, index) => (
                <li key={index} className="rounded-2xl border border-border bg-card/60 p-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary">
                      <ChannelIcon channel={step.channel} />
                    </span>

                    <Select
                      value={step.channel}
                      onValueChange={(value) => patchStep(index, { channel: value as Channel })}
                    >
                      <SelectTrigger className="h-9 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-2">
                      <Label htmlFor={`delay-${index}`} className="text-xs text-muted-foreground">
                        Wait
                      </Label>
                      <Input
                        id={`delay-${index}`}
                        type="number"
                        min={0}
                        max={60}
                        value={step.delay_days}
                        onChange={(e) => patchStep(index, { delay_days: Math.max(0, Number(e.target.value)) })}
                        className="h-9 w-16 text-center"
                      />
                      <span className="text-xs text-muted-foreground">days → Day {cumulativeDay(index)}</span>
                    </div>

                    <div className="ml-auto flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => moveStep(index, -1)}
                        disabled={index === 0}
                        aria-label="Move step up"
                      >
                        <GripVertical />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeStep(index)}
                        disabled={steps.length === 1}
                        aria-label="Delete step"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>

                  {step.channel === 'email' && (
                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`subject-${index}`}>Subject</Label>
                      <Input
                        id={`subject-${index}`}
                        value={step.subject ?? ''}
                        onChange={(e) => patchStep(index, { subject: e.target.value })}
                        placeholder="quick idea for {{company}}"
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Label htmlFor={`body-${index}`}>Message</Label>
                      <div className="flex flex-wrap gap-1">
                        {MERGE_TAGS.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => patchStep(index, { message_template: `${step.message_template}${tag}` })}
                            className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      id={`body-${index}`}
                      value={step.message_template}
                      rows={4}
                      onChange={(e) => patchStep(index, { message_template: e.target.value })}
                    />
                    <p className="text-right text-[11px] text-muted-foreground">
                      {step.message_template.length} characters
                      {step.channel === 'linkedin' && step.message_template.length > 300 && (
                        <span className="ml-1 text-warm">· over LinkedIn’s 300-char connection note limit</span>
                      )}
                    </p>
                  </div>

                  <label className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-3.5 py-3">
                    <span className="min-w-0">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <Sparkles className="size-3.5 text-primary" />
                        AI-personalise per prospect
                      </span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        Rewrites the body around each prospect’s real signals, keeping your framing.
                      </span>
                    </span>
                    <Switch
                      checked={step.ai_personalize}
                      onCheckedChange={(checked) => patchStep(index, { ai_personalize: checked })}
                    />
                  </label>
                </li>
              ))}
            </ol>

            <Button variant="secondary" className="w-full" onClick={addStep}>
              <Plus /> Add step
            </Button>
          </div>

          {/* Live preview */}
          <div className="xl:sticky xl:top-6 xl:self-start">
            <div className="rounded-2xl border border-border bg-card/60">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <Eye className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Live preview</h2>
                </div>
                <Select value={previewId} onValueChange={setPreviewId}>
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sampleProspects.map((prospect) => (
                      <SelectItem key={prospect.id} value={prospect.id}>
                        {prospect.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {previewProspect && (
                <div className="flex items-center gap-3 border-b border-border px-5 py-3.5">
                  <PersonAvatar name={previewProspect.full_name} className="size-8" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{previewProspect.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {previewProspect.title} · {previewProspect.company}
                    </p>
                  </div>
                </div>
              )}

              <ol className="space-y-4 p-5">
                {steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                      <ChannelIcon channel={step.channel} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Day {cumulativeDay(index)}
                        {step.ai_personalize && <span className="ml-1.5 text-primary">· AI</span>}
                      </p>
                      {step.channel === 'email' && step.subject && (
                        <p className="mt-1 truncate text-xs font-medium">
                          {renderPreview(step.subject, previewProspect)}
                        </p>
                      )}
                      <p className="mt-1.5 whitespace-pre-wrap rounded-xl rounded-tl-sm bg-secondary/70 px-3 py-2 text-xs leading-relaxed text-foreground/85">
                        {renderPreview(step.message_template, previewProspect)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="border-t border-border bg-secondary/30 px-5 py-3 text-xs text-muted-foreground">
                Sent from your accounts — paced safely
              </p>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ---------------------------------------------------- Analytics */}
      <TabsContent value="analytics" className="mt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/60 p-5">
            <h2 className="text-sm font-semibold">Funnel</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Conversion at each stage of this sequence</p>
            <div className="mt-6">
              <FunnelChart data={funnel} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Reply rate</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-positive">{sequence.reply_rate}%</p>
              <p className="mt-1 text-xs text-muted-foreground">{sequence.replied_count} of {sequence.enrolled_count} enrolled</p>
            </div>
            <div className="rounded-2xl border border-border bg-card/60 p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Steps</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{steps.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Over {cumulativeDay(steps.length - 1)} days</p>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* ----------------------------------------------------- Enrolled */}
      <TabsContent value="enrolled" className="mt-6">
        {prospects.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            Nobody is enrolled yet. Add prospects from the Prospects page.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card/60">
            {prospects.map((prospect) => (
              <li key={prospect.id} className="flex items-center gap-3 px-5 py-3.5">
                <PersonAvatar name={prospect.full_name} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{prospect.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {prospect.title} · {prospect.company}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground">
                  {prospect.sequence_status.replace('_', ' ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </TabsContent>
    </Tabs>
  )
}
