import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth'
import { ApiError, getDashboardStats } from '@/lib/data/repo'
import { AppSidebar } from '@/components/app/sidebar'
import { BackendOfflineBanner } from '@/components/app/backend-offline-banner'

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s · OutreachHalo' },
  robots: { index: false, follow: false },
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/sign-in')

  // The shell only needs this for the inbox badge. A backend blip should degrade
  // the badge, not take down every page inside the layout.
  let unread = 0
  let offlineMessage: string | null = null

  try {
    unread = (await getDashboardStats()).unread_replies
  } catch (error) {
    if (error instanceof ApiError && error.isUnreachable) {
      offlineMessage = error.message
    } else {
      console.error('Could not load sidebar stats:', error)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar
        userName={session.profile.full_name ?? 'You'}
        userEmail={session.profile.email ?? ''}
        orgName={session.organization.name}
        plan={session.organization.plan}
        unread={unread}
      />
      <main id="main" className="min-w-0 flex-1">
        {offlineMessage && <BackendOfflineBanner message={offlineMessage} />}
        {children}
      </main>
    </div>
  )
}
