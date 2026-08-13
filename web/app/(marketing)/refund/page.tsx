import type { Metadata } from 'next'

import { SITE } from '@/lib/content/site'
import { ProsePage } from '@/components/marketing/page-templates'

export const metadata: Metadata = {
  title: 'Refund policy',
  description: `When ${SITE.name} refunds, when it does not, and how cancellation works. Two clicks, no retention calls.`,
  alternates: { canonical: '/refund' },
}

export default function RefundPage() {
  return (
    <ProsePage title="Refund policy" updated="1 August 2026">
      <p>
        Short version: the trial exists so you do not need a refund. If something has genuinely gone wrong, email us and
        we will sort it out without a script.
      </p>

      <div>
        <h2>1. The free trial</h2>
        <p>
          Every paid plan starts with a 7-day free trial with full functionality. Cancel any time before it ends and no
          charge is made. This is the intended way to evaluate the product.
        </p>
      </div>

      <div>
        <h2>2. Cancelling</h2>
        <p>
          Cancellation is two clicks in the billing page. There is no retention flow, no “are you sure” carousel and no
          requirement to contact support. Your subscription stays active until the end of the period you already paid
          for, and your data remains accessible during that window.
        </p>
      </div>

      <div>
        <h2>3. When we refund</h2>
        <ul>
          <li>You were charged after cancelling — refunded in full, always.</li>
          <li>A billing error or duplicate charge — refunded in full.</li>
          <li>
            A material fault on our side that made the service unusable for a significant part of the period — refunded
            pro rata.
          </li>
          <li>
            You were charged within the last 14 days and never connected an account or sent a message — refunded in full,
            no questions.
          </li>
        </ul>
      </div>

      <div>
        <h2>4. When we usually do not</h2>
        <ul>
          <li>Mid-period cancellation of a used subscription — you keep access until the period ends instead.</li>
          <li>Unused monthly limits. Limits do not roll over and are not refundable.</li>
          <li>Dissatisfaction with reply rates. Outcomes depend on your offer, list and market, which we do not control.</li>
          <li>Platform restrictions caused by settings you raised beyond our recommended defaults.</li>
        </ul>
      </div>

      <div>
        <h2>5. How to request one</h2>
        <p>
          Email <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">{SITE.email}</a> from the address on
          the account with the charge date. We reply within two business days and approved refunds reach your card within
          5–10 business days, depending on your bank.
        </p>
      </div>

      <div>
        <h2>6. Custom plans</h2>
        <p>
          Custom-tier agreements are governed by the refund terms in their own order form, which take precedence over
          this page.
        </p>
      </div>
    </ProsePage>
  )
}
