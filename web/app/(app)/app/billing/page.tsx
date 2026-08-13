import type { Metadata } from 'next'

import { getBilling } from '@/lib/data/repo'
import { STRIPE_ENABLED } from '@/lib/env'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { BillingView } from '@/components/app/billing-view'

export const metadata: Metadata = { title: 'Billing' }

/**
 * Representative test-mode invoices. With Stripe configured the backend serves
 * the real list from the Stripe API instead.
 * TODO: requires STRIPE_SECRET_KEY on the backend.
 */
function testInvoices(anchor: string) {
  const start = new Date(anchor)
  return [0, 1, 2].map((i) => {
    const date = new Date(start)
    date.setMonth(date.getMonth() - i)
    return {
      id: `in_test_${i}`,
      date: date.toISOString(),
      amount: 5900,
      status: i === 0 ? 'paid' : 'paid',
      plan: 'Pro — monthly',
    }
  })
}

export default async function BillingPage() {
  const { organization, subscription, usage } = await getBilling()
  const invoices = subscription.status === 'trialing' ? [] : testInvoices(organization.billing_anchor)

  return (
    <>
      <PageHeader
        title="Billing"
        description="Usage resets on your own billing date. Limits pause the agent rather than generating an overage charge."
      />
      <PageBody>
        <BillingView
          organization={organization}
          subscription={subscription}
          usage={usage}
          invoices={invoices}
          stripeEnabled={STRIPE_ENABLED}
        />
      </PageBody>
    </>
  )
}
