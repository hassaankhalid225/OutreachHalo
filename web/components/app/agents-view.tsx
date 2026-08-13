'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil, Plus, Zap } from 'lucide-react'
import { toast } from 'sonner'

import { createAgentAction, updateAgentAction } from '@/app/actions/app'
import { cn } from '@/lib/utils'
import type { Agent } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChannelIcon, LiveDot } from '@/components/product/atoms'

const APPROVAL_OPTIONS = [
  { value: 'approve_first', label: 'Approve first message' },
  { value: 'approve_all', label: 'Approve every message' },
  { value: 'autopilot', label: 'Full autopilot' },
]

function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter()
  const [editing, setEditing] = React.useState(false)
  const [name, setName] = React.useState(agent.name)
  const [cap, setCap] = React.useState(agent.daily_cap)

  async function patch(update: Parameters<typeof updateAgentAction>[1]) {
    await updateAgentAction(agent.id, update)
    router.refresh()
  }

  async function commitName() {
    setEditing(false)
    if (name.trim() && name !== agent.name) {
      await patch({ name: name.trim() })
      toast.success('Agent renamed')
    } else {
      setName(agent.name)
    }
  }

  const active = agent.status === 'active'

  return (
    <div
      className={cn(
        'rounded-2xl border bg-card/60 p-5 transition-colors',
        active ? 'border-positive/25' : 'border-border'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {active ? <LiveDot /> : <span className="size-2.5 shrink-0 rounded-full bg-muted-foreground/50" />}
          {editing ? (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={commitName}
              onKeyDown={(e) => e.key === 'Enter' && commitName()}
              className="h-8 max-w-[12rem]"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="group flex min-w-0 items-center gap-1.5"
            >
              <span className="truncate text-base font-semibold">{agent.name}</span>
              <Pencil className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          )}
        </div>

        <Switch
          checked={active}
          onCheckedChange={(checked) => patch({ status: checked ? 'active' : 'paused' })}
          aria-label={`Toggle ${agent.name}`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {agent.channels.map((channel) => (
          <span
            key={channel}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2 py-1 text-[11px] text-muted-foreground"
          >
            <ChannelIcon channel={channel} />
            {channel === 'linkedin' ? 'LinkedIn' : 'Email'}
          </span>
        ))}
        <Badge variant="secondary">{APPROVAL_OPTIONS.find((o) => o.value === agent.approval_mode)?.label}</Badge>
      </div>

      <div className="mt-5 space-y-4 border-t border-border pt-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Approval mode</Label>
          <Select value={agent.approval_mode} onValueChange={(value) => patch({ approval_mode: value })}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {APPROVAL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <Label className="text-xs text-muted-foreground">Daily cap</Label>
            <span className="font-mono text-xs tabular-nums">{cap}/day</span>
          </div>
          <Slider
            value={[cap]}
            min={5}
            max={100}
            step={5}
            onValueChange={(value) => setCap(value[0])}
            onValueCommit={(value) => patch({ daily_cap: value[0] })}
          />
        </div>

        {agent.tone && <p className="text-xs text-muted-foreground">Tone: {agent.tone}</p>}
      </div>
    </div>
  )
}

export function AgentsView({ agents, limit, planName }: { agents: Agent[]; limit: number; planName: string }) {
  const router = useRouter()
  const [creating, setCreating] = React.useState(false)
  const atLimit = agents.length >= limit

  async function addAgent() {
    setCreating(true)
    await createAgentAction(`Agent ${agents.length + 1}`)
    setCreating(false)
    toast.success('Agent created')
    router.refresh()
  }

  const addButton = (
    <Button onClick={addAgent} loading={creating} disabled={atLimit}>
      <Plus /> Add agent
    </Button>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {agents.length} of {Number.isFinite(limit) ? limit : '∞'} agents used on {planName}
        </p>
        {atLimit ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{addButton}</span>
            </TooltipTrigger>
            <TooltipContent>
              You are at your plan’s agent limit. Upgrade in Billing to add more.
            </TooltipContent>
          </Tooltip>
        ) : (
          addButton
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}

        {!atLimit && (
          <button
            type="button"
            onClick={addAgent}
            className="flex min-h-[16rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
              <Zap className="size-4" />
            </span>
            <span className="text-sm font-medium">Add another agent</span>
            <span className="max-w-[14rem] text-center text-xs text-muted-foreground">
              Run a second ICP or a second offer without mixing the reporting.
            </span>
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card/40 p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Check className="size-4 text-positive" />
          What an agent actually does each day
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <li>· Runs a search against your connected LinkedIn for people matching your ICP</li>
          <li>· Scores every match across 18 intent signals and attaches the evidence</li>
          <li>· Writes the next message for anyone due a step in an active sequence</li>
          <li>· Queues those sends inside your working hours, up to the daily cap</li>
          <li>· Classifies every reply and, where enabled, answers on autopilot</li>
        </ul>
      </div>
    </div>
  )
}
