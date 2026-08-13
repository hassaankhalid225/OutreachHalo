import type { Metadata } from 'next'

import { getAccounts } from '@/lib/data/repo'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { IntegrationsView } from '@/components/app/integrations-view'

export const metadata: Metadata = { title: 'Integrations' }

export default async function IntegrationsPage() {
  const accounts = await getAccounts()
  const connected = accounts.filter((a) => a.status !== 'disconnected').length

  return (
    <>
      <PageHeader
        title="Integrations"
        description={`${connected} of ${accounts.length} accounts connected. Messages go out from these, never from a burner.`}
      />
      <PageBody>
        <IntegrationsView accounts={accounts} />
      </PageBody>
    </>
  )
}
