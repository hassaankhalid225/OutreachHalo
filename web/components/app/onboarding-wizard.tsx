'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  Info,
  Rocket,
  SkipForward,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  analyzeWebsiteAction,
  connectAccountAction,
  launchAgentAction,
  saveBusinessProfileAction,
  saveIcpAction,
  setAccountCapAction,
} from '@/app/actions/app'
import { completeOnboarding } from '@/app/actions/auth'
import { cn } from '@/lib/utils'
import type { ConnectedAccount, IcpProfile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Skeleton } from '@/components/ui/misc'
import { ChipSelect, TagInput } from '@/components/ui/tag-input'
import { Logo, PROVIDER_GLYPHS, PROVIDER_LABELS, type ProviderKey } from '@/components/brand/logos'

const STEPS = [
  { key: 'business', label: 'Your business' },
  { key: 'icp', label: 'Ideal customer' },
  { key: 'accounts', label: 'Connect accounts' },
  { key: 'launch', label: 'Launch' },
] as const

const TITLE_SUGGESTIONS = ['Founder', 'CEO', 'VP Sales', 'Head of Growth', 'COO', 'Sales Director', 'CRO', 'Head of Revenue']
const INDUSTRY_OPTIONS = ['B2B SaaS', 'Marketing Agency', 'Professional Services', 'Fintech', 'Recruitment', 'E-commerce', 'Healthcare', 'Manufacturing']
const GEO_OPTIONS = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Netherlands', 'Australia', 'Nordics', 'Worldwide']

interface Analysis {
  what_you_sell: string
  who_you_target: string
  how_to_pitch: string
  source: string
  note: string | null
  url: string
}

/** Reveals text one chunk at a time so extraction visibly "happens". */
function useTypewriter(text: string, enabled: boolean, speed = 12) {
  const [shown, setShown] = React.useState(enabled ? '' : text)

  React.useEffect(() => {
    if (!enabled) {
      setShown(text)
      return
    }
    let index = 0
    setShown('')
    const id = window.setInterval(() => {
      index += 3
      setShown(text.slice(0, index))
      if (index >= text.length) window.clearInterval(id)
    }, speed)
    return () => window.clearInterval(id)
  }, [text, enabled, speed])

  return shown
}

function AnalysisField({
  label,
  value,
  animate,
  onChange,
}: {
  label: string
  value: string
  animate: boolean
  onChange: (next: string) => void
}) {
  const shown = useTypewriter(value, animate)
  const [touched, setTouched] = React.useState(false)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea
        value={touched ? value : shown}
        rows={2}
        onChange={(e) => {
          setTouched(true)
          onChange(e.target.value)
        }}
        onFocus={() => setTouched(true)}
      />
    </div>
  )
}

export function OnboardingWizard({
  firstName,
  initialIcp,
  initialAccounts,
}: {
  firstName: string
  initialIcp: IcpProfile
  initialAccounts: ConnectedAccount[]
}) {
  const router = useRouter()
  const [step, setStep] = React.useState(0)
  const [busy, setBusy] = React.useState(false)

  // Step 1
  const [url, setUrl] = React.useState('')
  const [analyzing, setAnalyzing] = React.useState(false)
  const [analysis, setAnalysis] = React.useState<Analysis | null>(null)

  // Step 2
  const [jobTitles, setJobTitles] = React.useState<string[]>(initialIcp.job_titles ?? [])
  const [sizeRange, setSizeRange] = React.useState<[number, number]>([
    initialIcp.company_size_min ?? 10,
    initialIcp.company_size_max ?? 250,
  ])
  const [industries, setIndustries] = React.useState<string[]>(initialIcp.industries ?? [])
  const [geographies, setGeographies] = React.useState<string[]>(initialIcp.geographies ?? [])
  const [keywords, setKeywords] = React.useState<string[]>(initialIcp.keywords ?? [])

  // Step 3
  const [accounts, setAccounts] = React.useState(initialAccounts)
  const [connecting, setConnecting] = React.useState<string | null>(null)

  // Step 4
  const [agentName, setAgentName] = React.useState('Outbound Agent')

  async function analyze() {
    if (!url.trim()) {
      toast.error('Enter your website URL first.')
      return
    }
    setAnalyzing(true)
    setAnalysis(null)

    const result = await analyzeWebsiteAction(url)
    setAnalyzing(false)

    if (!result.ok) {
      toast.error(result.error)
      return
    }

    setAnalysis(result.data as Analysis)
    toast.success('Business understood')
  }

  async function nextFromBusiness() {
    if (!analysis) {
      toast.error('Analyse your website first — it is what the agent learns from.')
      return
    }
    setBusy(true)
    await saveBusinessProfileAction({
      website_url: analysis.url,
      what_you_sell: analysis.what_you_sell,
      who_you_target: analysis.who_you_target,
      how_to_pitch: analysis.how_to_pitch,
    })
    setBusy(false)
    setStep(1)
  }

  async function nextFromIcp() {
    if (jobTitles.length === 0) {
      toast.error('Add at least one job title you sell to.')
      return
    }
    setBusy(true)
    await saveIcpAction({
      job_titles: jobTitles,
      company_size_min: sizeRange[0],
      company_size_max: sizeRange[1],
      industries,
      geographies,
      keywords,
    })
    setBusy(false)
    setStep(2)
  }

  async function connect(provider: ProviderKey) {
    setConnecting(provider)
    await connectAccountAction(provider)
    setAccounts((prev) =>
      prev.map((a) => (a.provider === provider ? { ...a, status: 'mock_connected', connected_at: new Date().toISOString() } : a))
    )
    setConnecting(null)
    toast.success(`${PROVIDER_LABELS[provider]} connected`)
  }

  async function updateCap(id: string, cap: number) {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, daily_cap: cap } : a)))
    await setAccountCapAction(id, cap)
  }

  async function launch() {
    setBusy(true)
    await launchAgentAction(agentName)
    await completeOnboarding()
    toast.success('Your agent is live — it starts working in the morning.')
    router.push('/app/dashboard')
    router.refresh()
  }

  /**
   * Leave setup entirely. Whatever was already saved is kept; the rest is
   * available in Settings. Your workspace is seeded either way, so the dashboard
   * is never empty after skipping.
   */
  async function skipSetup() {
    setBusy(true)
    await completeOnboarding()
    toast.success('Setup skipped. You can finish it any time in Settings.')
    router.push('/app/dashboard')
    router.refresh()
  }

  const connectedCount = accounts.filter((a) => a.status !== 'disconnected').length

  return (
    <div className="relative flex min-h-dvh flex-col">
      <div aria-hidden className="glow-blob left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 bg-primary/12" />

      <header className="border-b border-border px-5 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-muted-foreground sm:block">
              Step {step + 1} of {STEPS.length}
            </p>
            <Button variant="ghost" size="sm" onClick={skipSetup} loading={busy}>
              {!busy && <SkipForward />}
              Skip setup
            </Button>
          </div>
        </div>
      </header>

      {/* Stepper */}
      <div className="border-b border-border px-5 py-5 md:px-8">
        <ol className="mx-auto flex max-w-3xl items-center gap-2">
          {STEPS.map((entry, i) => {
            const done = i < step
            const active = i === step
            return (
              <li key={entry.key} className="flex flex-1 items-center gap-2">
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    done
                      ? 'bg-positive text-background'
                      : active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    'hidden truncate text-xs sm:inline',
                    active ? 'font-medium text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {entry.label}
                </span>
                {i < STEPS.length - 1 && (
                  <span className={cn('h-px flex-1 transition-colors', done ? 'bg-positive/50' : 'bg-border')} />
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="flex-1 px-5 py-10 md:px-8">
        <div className="mx-auto max-w-3xl">
          {/* ---------------------------------------------- Step 1 */}
          {step === 0 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Hi {firstName} — let’s start with your website.
              </h1>
              <p className="mt-3 text-muted-foreground">
                Everything the agent writes comes from this. One URL and it works out what you sell, who buys it, and how
                to pitch you.
              </p>

              <div className="mt-8 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Globe className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && analyze()}
                    placeholder="acme-analytics.com"
                    className="h-12 pl-10"
                    autoFocus
                  />
                </div>
                <Button size="lg" className="h-12" onClick={analyze} loading={analyzing}>
                  {!analyzing && <Sparkles />}
                  {analyzing ? 'Reading your site…' : 'Analyse'}
                </Button>
              </div>

              {analyzing && (
                <div className="mt-8 space-y-4 rounded-2xl border border-border bg-card/60 p-6">
                  <Skeleton className="h-4 w-40" />
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-14 w-full" />
                    </div>
                  ))}
                </div>
              )}

              {analysis && !analyzing && (
                <div className="mt-8 animate-fade-up rounded-2xl border border-positive/25 bg-card/60 p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-positive" />
                    <p className="text-sm font-medium">Business understood — edit anything that is off</p>
                  </div>

                  <div className="space-y-4">
                    <AnalysisField
                      label="What you sell"
                      value={analysis.what_you_sell}
                      animate
                      onChange={(v) => setAnalysis({ ...analysis, what_you_sell: v })}
                    />
                    <AnalysisField
                      label="Who you target"
                      value={analysis.who_you_target}
                      animate
                      onChange={(v) => setAnalysis({ ...analysis, who_you_target: v })}
                    />
                    <AnalysisField
                      label="How to pitch you"
                      value={analysis.how_to_pitch}
                      animate
                      onChange={(v) => setAnalysis({ ...analysis, how_to_pitch: v })}
                    />
                  </div>

                  {analysis.note && (
                    <p className="mt-5 flex items-start gap-2 rounded-xl border border-warm/25 bg-warm/[0.06] px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                      <Info className="mt-0.5 size-3.5 shrink-0 text-warm" />
                      {analysis.note}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
                <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                  Skip this step
                </Button>
                <Button size="lg" onClick={nextFromBusiness} loading={busy} disabled={!analysis}>
                  Continue <ArrowRight />
                </Button>
              </div>
            </div>
          )}

          {/* ---------------------------------------------- Step 2 */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Who should it go after?</h1>
              <p className="mt-3 text-muted-foreground">
                A good profile excludes more than it includes. You can change all of this later in settings.
              </p>

              <div className="mt-8 space-y-7 rounded-2xl border border-border bg-card/60 p-6">
                <div className="space-y-2">
                  <Label htmlFor="titles">Target job titles</Label>
                  <TagInput
                    id="titles"
                    value={jobTitles}
                    onChange={setJobTitles}
                    suggestions={TITLE_SUGGESTIONS}
                    placeholder="Founder, VP Sales…"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <Label>Company size</Label>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {sizeRange[0]}–{sizeRange[1] >= 1000 ? '1000+' : sizeRange[1]} employees
                    </span>
                  </div>
                  <Slider
                    value={sizeRange}
                    min={1}
                    max={1000}
                    step={1}
                    onValueChange={(value) => setSizeRange([value[0], value[1]] as [number, number])}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label>Industries</Label>
                  <ChipSelect options={INDUSTRY_OPTIONS} value={industries} onChange={setIndustries} />
                </div>

                <div className="space-y-2.5">
                  <Label>Geographies</Label>
                  <ChipSelect options={GEO_OPTIONS} value={geographies} onChange={setGeographies} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords (optional)</Label>
                  <TagInput
                    id="keywords"
                    value={keywords}
                    onChange={setKeywords}
                    suggestions={['outbound', 'pipeline', 'demand gen', 'revenue ops', 'GTM']}
                    placeholder="Words that show up in their posts…"
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" size="lg" onClick={() => setStep(0)}>
                  <ArrowLeft /> Back
                </Button>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="lg" onClick={() => setStep(2)}>
                    Skip this step
                  </Button>
                  <Button size="lg" onClick={nextFromIcp} loading={busy}>
                    Continue <ArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------- Step 3 */}
          {step === 2 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Connect the accounts you send from.</h1>
              <p className="mt-3 text-muted-foreground">
                Messages go out from your real profile and mailbox. Set a daily cap you are comfortable with — you can
                disconnect any of these in one click, any time.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {accounts.map((account) => {
                  const Glyph = PROVIDER_GLYPHS[account.provider as ProviderKey]
                  const connected = account.status !== 'disconnected'

                  return (
                    <div
                      key={account.id}
                      className={cn(
                        'rounded-2xl border p-5 transition-colors',
                        connected ? 'border-positive/25 bg-positive/[0.04]' : 'border-border bg-card/60'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="size-9 shrink-0 overflow-hidden rounded-lg">
                          <Glyph />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{PROVIDER_LABELS[account.provider as ProviderKey]}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {connected ? (account.account_label ?? 'Connected') : 'Not connected'}
                          </p>
                        </div>
                        {connected ? (
                          <CheckCircle2 className="size-5 shrink-0 animate-fade-up text-positive" />
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => connect(account.provider as ProviderKey)}
                            loading={connecting === account.provider}
                          >
                            Connect
                          </Button>
                        )}
                      </div>

                      {connected && (
                        <div className="mt-5 space-y-2.5 border-t border-border/60 pt-4">
                          <div className="flex items-baseline justify-between">
                            <Label className="text-xs text-muted-foreground">Daily cap</Label>
                            <span className="font-mono text-xs tabular-nums">{account.daily_cap}/day</span>
                          </div>
                          <Slider
                            value={[account.daily_cap]}
                            min={5}
                            max={100}
                            step={5}
                            onValueChange={(value) => updateCap(account.id, value[0])}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="mt-5 flex items-start gap-2 rounded-xl border border-warm/25 bg-warm/[0.06] px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0 text-warm" />
                Phase 1 connects these in mock mode so you can configure and demo the full product. Real OAuth to
                LinkedIn, Gmail and Outlook ships with the live sending integrations — nothing is sent from your real
                accounts until then.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <Button variant="ghost" size="lg" onClick={() => setStep(1)}>
                  <ArrowLeft /> Back
                </Button>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="lg" onClick={() => setStep(3)}>
                    Skip this step
                  </Button>
                  <Button size="lg" onClick={() => setStep(3)} disabled={connectedCount === 0}>
                    Continue <ArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------------------------------------- Step 4 */}
          {step === 3 && (
            <div className="animate-fade-up">
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready to launch.</h1>
              <p className="mt-3 text-muted-foreground">
                Your agent starts its first search in the morning and messages go out on approve-first, so you see the
                voice before anything leaves your account.
              </p>

              <div className="mt-8 space-y-3">
                <div className="rounded-2xl border border-border bg-card/60 p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Business</p>
                  <p className="mt-1.5 text-sm">{analysis?.what_you_sell ?? 'Saved from your website'}</p>
                </div>

                <div className="rounded-2xl border border-border bg-card/60 p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Ideal customer</p>
                  <p className="mt-1.5 text-sm">
                    {jobTitles.slice(0, 4).join(', ')}
                    {jobTitles.length > 4 && ` +${jobTitles.length - 4} more`} · {sizeRange[0]}–{sizeRange[1]} employees
                    {industries.length > 0 && ` · ${industries.slice(0, 2).join(', ')}`}
                  </p>
                </div>

                <div className="rounded-2xl border border-border bg-card/60 p-5">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Sending from</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {accounts
                      .filter((a) => a.status !== 'disconnected')
                      .map((account) => {
                        const Glyph = PROVIDER_GLYPHS[account.provider as ProviderKey]
                        return (
                          <span
                            key={account.id}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 py-1 pl-1 pr-3 text-xs"
                          >
                            <span className="size-5 overflow-hidden rounded">
                              <Glyph />
                            </span>
                            {account.daily_cap}/day
                          </span>
                        )
                      })}
                  </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-primary/25 bg-primary/[0.06] p-5">
                  <Label htmlFor="agent-name">Name your agent</Label>
                  <Input id="agent-name" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <Button variant="ghost" size="lg" onClick={() => setStep(2)}>
                  <ArrowLeft /> Back
                </Button>
                <Button size="xl" onClick={launch} loading={busy}>
                  {!busy && <Rocket />}
                  Launch my agent
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
