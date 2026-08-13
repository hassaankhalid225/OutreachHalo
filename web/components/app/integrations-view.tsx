'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { connectAccountAction, disconnectAccountAction, setAccountCapAction } from '@/app/actions/app'
import { cn, relativeTime } from '@/lib/utils'
import type { ConnectedAccount } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PROVIDER_GLYPHS, PROVIDER_LABELS, type ProviderKey } from '@/components/brand/logos'

export function IntegrationsView({ accounts }: { accounts: ConnectedAccount[] }) {
  const router = useRouter()
  const [busy, setBusy] = React.useState<string | null>(null)
  const [caps, setCaps] = React.useState<Record<string, number>>(
    Object.fromEntries(accounts.map((a) => [a.id, a.daily_cap]))
  )
  const [confirming, setConfirming] = React.useState<ConnectedAccount | null>(null)

  async function connect(account: ConnectedAccount) {
    setBusy(account.id)
    await connectAccountAction(account.provider)
    setBusy(null)
    toast.success(`${PROVIDER_LABELS[account.provider as ProviderKey]} connected`)
    router.refresh()
  }

  /** One click after confirm — the FAQ promises exactly this. */
  async function disconnect(account: ConnectedAccount) {
    setBusy(account.id)
    setConfirming(null)
    await disconnectAccountAction(account.id)
    setBusy(null)
    toast.success(`${PROVIDER_LABELS[account.provider as ProviderKey]} disconnected — sending stopped immediately`)
    router.refresh()
  }

  async function commitCap(id: string, cap: number) {
    await setAccountCapAction(id, cap)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => {
          const Glyph = PROVIDER_GLYPHS[account.provider as ProviderKey]
          const connected = account.status !== 'disconnected'
          const isMock = account.status === 'mock_connected'

          return (
            <div
              key={account.id}
              className={cn(
                'rounded-2xl border bg-card/60 p-5 transition-colors',
                connected ? 'border-positive/25' : 'border-border'
              )}
            >
              <div className="flex items-start gap-3">
                <span className="size-10 shrink-0 overflow-hidden rounded-xl">
                  <Glyph />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold">
                    {PROVIDER_LABELS[account.provider as ProviderKey]}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {connected ? account.account_label : 'Not connected'}
                  </p>
                </div>

                {connected ? (
                  <Badge variant={isMock ? 'warm' : 'positive'}>
                    <CheckCircle2 />
                    {isMock ? 'Mock connected' : 'Connected'}
                  </Badge>
                ) : (
                  <Badge variant="outline">Disconnected</Badge>
                )}
              </div>

              {connected && (
                <div className="mt-5 space-y-4 border-t border-border pt-4">
                  <div className="space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <Label className="text-xs text-muted-foreground">Daily sending cap</Label>
                      <span className="font-mono text-xs tabular-nums">{caps[account.id]}/day</span>
                    </div>
                    <Slider
                      value={[caps[account.id]]}
                      min={5}
                      max={100}
                      step={5}
                      onValueChange={(value) => setCaps((prev) => ({ ...prev, [account.id]: value[0] }))}
                      onValueCommit={(value) => commitCap(account.id, value[0])}
                    />
                    {caps[account.id] > 50 && (
                      <p className="flex items-start gap-1.5 text-[11px] text-warm">
                        <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                        Above 50/day starts to look automated. We recommend staying under 40.
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Last synced {account.last_synced_at ? relativeTime(account.last_synced_at) : 'never'}
                  </p>
                </div>
              )}

              <div className="mt-5">
                {connected ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setConfirming(account)}
                    loading={busy === account.id}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => connect(account)} loading={busy === account.id}>
                    Connect
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/40 p-5">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-positive" />
        <div>
          <h2 className="text-sm font-semibold">Your accounts, your control</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Every send is capped per account and spread across the working hours set in Settings. Disconnecting takes one
            click after the confirmation and stops all queued sends immediately — nothing is left in flight.
          </p>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Phase 1 note:</strong> accounts connect in mock mode so the whole product
            is configurable and demo-able. Real OAuth to LinkedIn, Gmail and Outlook ships with live sending — nothing
            leaves your real accounts before then.
          </p>
        </div>
      </div>

      <Dialog open={Boolean(confirming)} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Disconnect {confirming ? PROVIDER_LABELS[confirming.provider as ProviderKey] : ''}?
            </DialogTitle>
            <DialogDescription>
              All queued sends on this account stop immediately. Sequences using it will pause until you reconnect or
              switch the step to another channel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirming(null)}>
              Keep connected
            </Button>
            <Button variant="destructive" onClick={() => confirming && disconnect(confirming)}>
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
