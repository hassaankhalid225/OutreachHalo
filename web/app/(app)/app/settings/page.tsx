import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth'
import { getBusinessProfile, getIcp, getSettings } from '@/lib/data/repo'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { SettingsView } from '@/components/app/settings-view'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const session = await getSession()
  if (!session) redirect('/sign-in')

  const [settings, icp, business] = await Promise.all([getSettings(), getIcp(), getBusinessProfile()])

  return (
    <>
      <PageHeader title="Settings" description="Your profile, targeting, sending windows and notification preferences." />
      <PageBody>
        <SettingsView profile={session.profile} settings={settings} icp={icp} business={business} />
      </PageBody>
    </>
  )
}
