import type { Metadata } from 'next'

import { getSession } from '@/lib/auth'
import { getTeam } from '@/lib/data/repo'
import { limitsForPlan, planLabel } from '@/lib/content/pricing'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { TeamUpgradePrompt, TeamView } from '@/components/app/team-view'

export const metadata: Metadata = { title: 'Team' }

export default async function TeamPage() {
  const [session, members] = await Promise.all([getSession(), getTeam()])
  const plan = session?.organization.plan ?? 'trial'

  // Shared workspace is a Growth/Custom feature. Trial orgs get a preview of it.
  const hasTeamAccess = plan === 'growth' || plan === 'custom' || plan === 'trial'
  const limits = limitsForPlan(plan === 'trial' ? 'growth' : plan)

  return (
    <>
      <PageHeader
        title="Team"
        description="A shared workspace: same prospects, same sequences, separate sending accounts."
      />
      <PageBody>
        {hasTeamAccess ? (
          <TeamView members={members} seatLimit={limits.seats} />
        ) : (
          <TeamUpgradePrompt planName={planLabel(plan)} />
        )}
      </PageBody>
    </>
  )
}
