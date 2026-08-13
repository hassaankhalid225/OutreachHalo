'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Check, Download, Info, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { cancelSubscriptionAction, changePlanAction, resumeSubscriptionAction } from '@/app/actions/app'
import { PLANS, formatLimit, limitsForPlan, planLabel } from '@/lib/content/pricing'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import type { Organization, Subscription, UsageCounter } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/misc'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface Invoice {
  id: string
  date: string
  amount: number
  status: string
  plan: string
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = !Number.isFinite(limit)
  const pct = unlimited ? 0 : Math.min(100, Math.round((used / limit) * 100))
  const near = pct >= 80
  const full = pct >= 100

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm text-foreground/85">{label}</span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
          {used.toLocaleString()} / {formatLimit(limit)}
        </span>
      </div>
      <Progress
        value={pct}
        className="mt-2"
        indicatorClassName={cn(full ? 'bg-destructive' : near ? 'bg-warm' : 'bg-primary')}
      />
      {full && (
        <p className="mt-1.5 text-xs text-destructive">
          Limit reached — the agent has paused. Upgrade or wait for the reset.
        </p>
      )}
      {near && !full && <p className="mt-1.5 text-xs text-warm">{100 - pct}% of your allowance left this cycle.</p>}
    </div>
  )
}

export function BillingView({
  organization,
  subscription,
  usage,
  invoices,
  stripeEnabled,
}: {
  organization: Organization
  subscription: Subscription
  usage: UsageCounter
  invoices: Invoice[]
  stripeEnabled: boolean
}) {
  const router = useRouter()
  const [upgradeOpen, setUpgradeOpen] = React.useState(false)
  const [cancelOpen, setCancelOpen] = React.useState(false)
  const [busy, setBusy] = React.useState<string | null>(null)

  const currentPlan = subscription.plan ?? 'pro'
  const limits = limitsForPlan(organization.plan === 'trial' ? 'pro' : organization.plan)

  async function selectPlan(plan: 'pro' | 'growth' | 'custom') {
    setBusy(plan)
    const result = await changePlanAction(plan)
    setBusy(null)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    if (result.data?.checkoutUrl) {
      window.location.href = result.data.checkoutUrl
      return
    }

    setUpgradeOpen(false)
    toast.success(`Switched to ${planLabel(plan)}`)
    router.refresh()
  }

  async function cancel() {
    setBusy('cancel')
    await cancelSubscriptionAction()
    setBusy(null)
    setCancelOpen(false)
    toast.success('Cancelled. You keep access until the end of the period.')
    router.refresh()
  }

  async function resume() {
    setBusy('resume')
    await resumeSubscriptionAction()
    setBusy(null)
    toast.success('Subscription resumed')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Current plan --------------------------------------------- */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-semibold">{planLabel(organization.plan)}</h2>
                <Badge variant={subscription.status === 'trialing' ? 'warm' : 'positive'}>
                  {subscription.status ?? 'active'}
                </Badge>
                {subscription.cancel_at_period_end && <Badge variant="destructive">Cancels at period end</Badge>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {subscription.status === 'trialing'
                  ? `Trial ends ${subscription.current_period_end ? formatDate(subscription.current_period_end) : 'soon'} — you will not be charged before then.`
                  : `Renews ${subscription.current_period_end ? formatDate(subscription.current_period_end) : '—'}.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setUpgradeOpen(true)}>
                <Sparkles /> Change plan
              </Button>
              {subscription.cancel_at_period_end ? (
                <Button variant="secondary" onClick={resume} loading={busy === 'resume'}>
                  Resume
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setCancelOpen(true)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8 space-y-5 border-t border-border pt-6">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold">Usage this cycle</h3>
              <p className="text-xs text-muted-foreground">
                Resets {formatDate(usage.period_end)} — your billing date, not the 1st
              </p>
            </div>
            <UsageBar label="Prospects discovered" used={usage.prospects_used} limit={limits.prospects} />
            <UsageBar label="LinkedIn posts" used={usage.posts_used} limit={limits.posts} />
            <UsageBar label="Sending accounts" used={usage.senders_used} limit={limits.senders} />
          </div>

          <p className="mt-6 flex items-start gap-2 rounded-xl border border-border bg-secondary/40 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Hitting a limit pauses the agent gracefully. We never charge overage — you either upgrade or wait for the
            reset.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-sm font-semibold">What is included</h2>
          <ul className="mt-4 space-y-2.5">
            {(PLANS.find((p) => p.id === (organization.plan === 'trial' ? 'pro' : organization.plan)) ?? PLANS[0]).features
              .slice(0, 8)
              .map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary/15">
                    <Check className="size-3 text-primary" strokeWidth={3} />
                  </span>
                  <span className="text-foreground/80">{feature}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      {/* Invoices --------------------------------------------------- */}
      <div className="rounded-2xl border border-border bg-card/60">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Invoice history</h2>
          {!stripeEnabled && <Badge variant="warm">Stripe test mode</Badge>}
        </div>

        {invoices.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No invoices yet — your trial has not converted.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="whitespace-nowrap text-sm">{formatDate(invoice.date)}</TableCell>
                  <TableCell className="text-sm">{invoice.plan}</TableCell>
                  <TableCell className="font-mono text-sm tabular-nums">{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={invoice.status === 'paid' ? 'positive' : 'secondary'}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm" aria-label="Download invoice">
                      <Download />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {!stripeEnabled && (
          <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
            {/* TODO: requires STRIPE_SECRET_KEY — the backend then serves real Stripe invoices here. */}
            Add <code className="font-mono text-foreground">STRIPE_SECRET_KEY</code> to the backend and these rows come
            from the Stripe API. Until then they are representative test-mode data.
          </p>
        )}
      </div>

      {/* Upgrade modal ---------------------------------------------- */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Change plan</DialogTitle>
            <DialogDescription>
              Upgrades apply immediately and are prorated. Downgrades take effect at the end of the current cycle.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const current = plan.id === currentPlan
              return (
                <div
                  key={plan.id}
                  className={cn(
                    'flex flex-col rounded-2xl border p-5',
                    plan.highlight ? 'border-primary/40 bg-primary/[0.06]' : 'border-border'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{plan.name}</h3>
                    {plan.ribbon && <Badge>{plan.ribbon}</Badge>}
                  </div>

                  <p className="mt-3 text-2xl font-semibold tabular-nums">
                    {plan.price === null ? 'Custom' : `$${plan.price}`}
                    {plan.price !== null && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                  </p>

                  <ul className="mt-4 flex-1 space-y-2 text-xs text-muted-foreground">
                    <li>{formatLimit(plan.limits.prospects)} prospects / month</li>
                    <li>{formatLimit(plan.limits.agents)} AI agents</li>
                    <li>{formatLimit(plan.limits.senders)} sending accounts</li>
                    <li>{formatLimit(plan.limits.posts)} LinkedIn posts / month</li>
                  </ul>

                  <Button
                    className="mt-5 w-full"
                    variant={current ? 'secondary' : plan.highlight ? 'default' : 'secondary'}
                    disabled={current}
                    loading={busy === plan.id}
                    onClick={() => selectPlan(plan.id)}
                  >
                    {current ? 'Current plan' : plan.id === 'custom' ? 'Talk with us' : `Switch to ${plan.name}`}
                  </Button>
                </div>
              )
            })}
          </div>

          {!stripeEnabled && (
            <p className="flex items-start gap-2 rounded-xl border border-warm/25 bg-warm/[0.06] px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0 text-warm" />
              Stripe is not configured, so switching plans updates the workspace directly instead of opening Checkout.
              With <code className="font-mono">STRIPE_SECRET_KEY</code> set, this button redirects to a real test-mode
              Checkout session.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel modal — two clicks, no retention flow ---------------- */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel your subscription?</DialogTitle>
            <DialogDescription>
              You keep full access until{' '}
              {subscription.current_period_end ? formatDate(subscription.current_period_end) : 'the end of the period'}.
              Nothing is deleted, and you can resume with one click.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCancelOpen(false)}>
              Keep my plan
            </Button>
            <Button variant="destructive" onClick={cancel} loading={busy === 'cancel'}>
              Cancel subscription
            </Button>
          </DialogFooter>
          <p className="text-center text-xs text-muted-foreground">
            No retention call, no survey. That is the whole flow.{' '}
            <a href="/refund" className="inline-flex items-center gap-0.5 text-primary hover:underline">
              Refund policy <ArrowUpRight className="size-3" />
            </a>
          </p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
