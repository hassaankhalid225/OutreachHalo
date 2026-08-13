import type { Metadata } from 'next'

import { getSession } from '@/lib/auth'
import { getAgents } from '@/lib/data/repo'
import { limitsForPlan, planLabel } from '@/lib/content/pricing'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { AgentsView } from '@/components/app/agents-view'

export const metadata: Metadata = { title: 'Agents' }

export default async function AgentsPage() {
  const [session, agents] = await Promise.all([getSession(), getAgents()])
  const plan = session?.organization.plan ?? 'trial'
  const limits = limitsForPlan(plan)

  return (
    <>
      <PageHeader
        title="Agents"
        description="Each agent runs its own ICP, channels and approval mode. Pause one and it stops mid-sequence without losing state."
      />
      <PageBody>
        <AgentsView agents={agents} limit={limits.agents} planName={planLabel(plan)} />
      </PageBody>
    </>
  )
}
