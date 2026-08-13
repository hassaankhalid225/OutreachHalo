'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Save } from 'lucide-react'
import { toast } from 'sonner'

import { saveIcpAction, updateSettingsAction } from '@/app/actions/app'
import { signOut } from '@/app/actions/auth'
import type { BusinessProfile, IcpProfile, OrgSettings, Profile } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PersonAvatar } from '@/components/ui/avatar'
import { ChipSelect, TagInput } from '@/components/ui/tag-input'

const INDUSTRY_OPTIONS = ['B2B SaaS', 'Marketing Agency', 'Professional Services', 'Fintech', 'Recruitment', 'E-commerce', 'Healthcare', 'Manufacturing']
const GEO_OPTIONS = ['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Netherlands', 'Australia', 'Nordics', 'Worldwide']
const TIMEZONES = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Stockholm',
  'Asia/Dubai',
  'Asia/Singapore',
  'Australia/Sydney',
  'UTC',
]

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const formatHour = (hour: number) => `${String(hour).padStart(2, '0')}:00`

export function SettingsView({
  profile,
  settings,
  icp,
  business,
}: {
  profile: Profile
  settings: OrgSettings
  icp: IcpProfile
  business: BusinessProfile
}) {
  const router = useRouter()

  // Profile
  const [fullName, setFullName] = React.useState(profile.full_name ?? '')

  // ICP
  const [jobTitles, setJobTitles] = React.useState<string[]>(icp.job_titles ?? [])
  const [sizeRange, setSizeRange] = React.useState<[number, number]>([icp.company_size_min, icp.company_size_max])
  const [industries, setIndustries] = React.useState<string[]>(icp.industries ?? [])
  const [geographies, setGeographies] = React.useState<string[]>(icp.geographies ?? [])
  const [keywords, setKeywords] = React.useState<string[]>(icp.keywords ?? [])

  // Sending + notifications
  const [state, setState] = React.useState<OrgSettings>(settings)
  const [saving, setSaving] = React.useState<string | null>(null)

  // Danger zone
  const [confirmText, setConfirmText] = React.useState('')

  async function saveIcp() {
    setSaving('icp')
    await saveIcpAction({
      job_titles: jobTitles,
      company_size_min: sizeRange[0],
      company_size_max: sizeRange[1],
      industries,
      geographies,
      keywords,
    })
    setSaving(null)
    toast.success('Ideal customer profile updated — tomorrow’s list will use it')
    router.refresh()
  }

  async function saveSettings(section: string, patch: Partial<OrgSettings>) {
    setSaving(section)
    const next = { ...state, ...patch }
    setState(next)
    await updateSettingsAction(patch)
    setSaving(null)
    toast.success('Saved')
    router.refresh()
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList className="flex-wrap">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="icp">Ideal customer</TabsTrigger>
        <TabsTrigger value="sending">Sending</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="danger">Danger zone</TabsTrigger>
      </TabsList>

      {/* ------------------------------------------------------ Profile */}
      <TabsContent value="profile" className="mt-6">
        <div className="max-w-2xl space-y-5 rounded-2xl border border-border bg-card/60 p-6">
          <div className="flex items-center gap-4">
            <PersonAvatar name={fullName || 'You'} className="size-16" />
            <div>
              <p className="text-sm font-medium">Profile picture</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Generated from your name. Upload lands with Supabase Storage in the live build.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email ?? ''} disabled />
            <p className="text-xs text-muted-foreground">Contact support to change the email on the account.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="what-you-sell">What you sell</Label>
            <Textarea id="what-you-sell" defaultValue={business.what_you_sell ?? ''} rows={2} readOnly />
            <p className="text-xs text-muted-foreground">
              Extracted from {business.website_url ?? 'your website'} during onboarding.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* ---------------------------------------------------------- ICP */}
      <TabsContent value="icp" className="mt-6">
        <div className="max-w-2xl space-y-6 rounded-2xl border border-border bg-card/60 p-6">
          <div className="space-y-2">
            <Label htmlFor="titles">Target job titles</Label>
            <TagInput
              id="titles"
              value={jobTitles}
              onChange={setJobTitles}
              suggestions={['Founder', 'CEO', 'VP Sales', 'Head of Growth', 'COO', 'CRO']}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <Label>Company size</Label>
              <span className="font-mono text-xs tabular-nums text-muted-foreground">
                {sizeRange[0]}–{sizeRange[1]} employees
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
            <Label htmlFor="keywords">Keywords</Label>
            <TagInput id="keywords" value={keywords} onChange={setKeywords} />
          </div>

          <Button onClick={saveIcp} loading={saving === 'icp'}>
            <Save /> Save ICP
          </Button>
        </div>
      </TabsContent>

      {/* ------------------------------------------------------ Sending */}
      <TabsContent value="sending" className="mt-6">
        <div className="max-w-2xl space-y-6 rounded-2xl border border-border bg-card/60 p-6">
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={state.timezone} onValueChange={(value) => saveSettings('sending', { timezone: value })}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hours-start">Sending starts</Label>
              <Select
                value={String(state.sending_hours_start)}
                onValueChange={(value) => saveSettings('sending', { sending_hours_start: Number(value) })}
              >
                <SelectTrigger id="hours-start">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((hour) => (
                    <SelectItem key={hour} value={String(hour)}>
                      {formatHour(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours-end">Sending stops</Label>
              <Select
                value={String(state.sending_hours_end)}
                onValueChange={(value) => saveSettings('sending', { sending_hours_end: Number(value) })}
              >
                <SelectTrigger id="hours-end">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((hour) => (
                    <SelectItem key={hour} value={String(hour)}>
                      {formatHour(hour)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="rounded-xl border border-border bg-secondary/40 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            Sends are spread evenly across this window rather than fired in a burst. Anything queued outside it waits
            until the window reopens.
          </p>

          <div className="space-y-2">
            <Label htmlFor="booking">Booking link</Label>
            <Input
              id="booking"
              value={state.booking_url ?? ''}
              onChange={(e) => setState({ ...state, booking_url: e.target.value })}
              onBlur={() => saveSettings('booking', { booking_url: state.booking_url })}
              placeholder="https://cal.com/you/15min"
            />
            <p className="text-xs text-muted-foreground">
              Autopilot shares this the moment someone is ready. Used by the “Share booking link” action in the inbox.
            </p>
          </div>
        </div>
      </TabsContent>

      {/* ------------------------------------------------ Notifications */}
      <TabsContent value="notifications" className="mt-6">
        <div className="max-w-2xl divide-y divide-border rounded-2xl border border-border bg-card/60">
          {[
            {
              key: 'notify_hot_reply' as const,
              title: 'Hot reply alerts',
              body: 'Email me within the hour when someone tagged Interested is waiting on a response.',
            },
            {
              key: 'notify_daily_digest' as const,
              title: 'Daily digest',
              body: 'One morning summary of what the agent found, sent and heard back.',
            },
            {
              key: 'notify_product_updates' as const,
              title: 'Product updates',
              body: 'Occasional emails about new features. No more than monthly.',
            },
          ].map((option) => (
            <label key={option.key} className="flex cursor-pointer items-start justify-between gap-4 p-5">
              <span className="min-w-0">
                <span className="block text-sm font-medium">{option.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">{option.body}</span>
              </span>
              <Switch
                checked={state[option.key]}
                onCheckedChange={(checked) => saveSettings('notifications', { [option.key]: checked })}
              />
            </label>
          ))}
        </div>
      </TabsContent>

      {/* -------------------------------------------------- Danger zone */}
      <TabsContent value="danger" className="mt-6">
        <div className="max-w-2xl rounded-2xl border border-destructive/30 bg-destructive/[0.04] p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Delete this workspace</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Removes every prospect, sequence, conversation and connected account. Sending stops immediately. Billing
                records are kept for seven years as required by law; everything else is deleted within 30 days.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Label htmlFor="confirm">
              Type <span className="font-mono text-destructive">DELETE</span> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          <form action={signOut} className="mt-4">
            <Button type="submit" variant="destructive" disabled={confirmText !== 'DELETE'}>
              Delete workspace permanently
            </Button>
          </form>
          <p className="mt-2 text-xs text-muted-foreground">
            In this build deletion signs you out and clears the session. Hard deletion runs through the backend’s cascade
            once Supabase is connected.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
