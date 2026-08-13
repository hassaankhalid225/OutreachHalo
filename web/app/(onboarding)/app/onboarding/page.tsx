import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth'
import { getAccounts, getIcp } from '@/lib/data/repo'
import { OnboardingWizard } from '@/components/app/onboarding-wizard'

export const metadata: Metadata = {
  title: 'Set up your agent',
  robots: { index: false, follow: false },
}

export default async function OnboardingPage() {
  const session = await getSession()
  if (!session) redirect('/sign-in')

  const [icp, accounts] = await Promise.all([getIcp(), getAccounts()])

  return (
    <OnboardingWizard
      firstName={(session.profile.full_name ?? 'there').split(' ')[0]}
      initialIcp={icp}
      initialAccounts={accounts}
    />
  )
}
