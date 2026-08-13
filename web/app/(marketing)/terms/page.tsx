import type { Metadata } from 'next'

import { SITE } from '@/lib/content/site'
import { ProsePage } from '@/components/marketing/page-templates'

export const metadata: Metadata = {
  title: 'Terms of service',
  description: `The terms governing your use of ${SITE.name}, including acceptable use, your responsibilities as the sender, billing and cancellation.`,
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <ProsePage title="Terms of service" updated="1 August 2026">
      <p>
        By creating an account you agree to these terms. They are written to be readable; where something is a genuine
        obligation on you, it is stated plainly rather than buried.
      </p>

      <div>
        <h2>1. The service</h2>
        <p>
          {SITE.name} is software that helps you find prospects, run outreach sequences from accounts you connect, and
          publish content. It is a tool operated by you. We do not act as your agent and we make no guarantee about
          replies, meetings or revenue.
        </p>
      </div>

      <div>
        <h2>2. Your responsibilities as the sender</h2>
        <p>
          Messages sent through the service go out from <strong>your</strong> accounts, under your identity. You are
          responsible for:
        </p>
        <ul>
          <li>Complying with the terms of each platform you connect, including LinkedIn, Google and Microsoft.</li>
          <li>Complying with applicable law, including GDPR, PECR, CAN-SPAM and equivalent regimes.</li>
          <li>Honouring opt-out and unsubscribe requests promptly.</li>
          <li>The accuracy and content of anything you send, whether you wrote it or approved it.</li>
        </ul>
        <p>
          We provide daily caps, pacing controls and approval modes precisely so you can meet these obligations. Setting
          them aside is your call and your risk.
        </p>
      </div>

      <div>
        <h2>3. Acceptable use</h2>
        <p>You may not use the service to:</p>
        <ul>
          <li>Send unlawful, harassing, deceptive or misleading messages.</li>
          <li>Impersonate another person or organisation.</li>
          <li>Circumvent platform rate limits or automated-access restrictions.</li>
          <li>Upload or process data you have no lawful basis to process.</li>
          <li>Resell access without a written agreement with us.</li>
        </ul>
        <p>We may suspend an account that we reasonably believe is being used this way.</p>
      </div>

      <div>
        <h2>4. Trials, billing and cancellation</h2>
        <ul>
          <li>Paid plans include a 7-day free trial. Cancel before it ends and you are not charged.</li>
          <li>Subscriptions renew monthly until cancelled. Cancellation takes effect at the end of the current period.</li>
          <li>Usage limits reset on your own billing anchor date, not the 1st of the calendar month.</li>
          <li>Hitting a limit pauses the agent. We do not levy overage charges.</li>
          <li>Cancellation is two clicks in the billing page. We do not require a call or an email.</li>
        </ul>
      </div>

      <div>
        <h2>5. AI-generated output</h2>
        <p>
          Drafts produced by the service are suggestions. They can be wrong, and in approve-first and approve-all modes
          you are the one who sends them. If you enable full autopilot you accept that messages will be sent without
          individual review, and you remain responsible for their content.
        </p>
      </div>

      <div>
        <h2>6. Availability</h2>
        <p>
          We aim for high availability but do not offer a contractual uptime guarantee on self-serve plans. Planned
          maintenance is announced in-product where practical.
        </p>
      </div>

      <div>
        <h2>7. Liability</h2>
        <p>
          To the maximum extent permitted by law, our aggregate liability is limited to the fees you paid in the twelve
          months preceding the claim. We are not liable for lost profits, lost pipeline, or platform account restrictions
          arising from how you configured or used the service.
        </p>
      </div>

      <div>
        <h2>8. Trademarks</h2>
        <p>
          {SITE.name} is not affiliated with, endorsed by or sponsored by LinkedIn, Microsoft, Google, Anthropic or any
          other company named on this site. All product names and trademarks belong to their respective owners and are
          used only to identify the services we interoperate with.
        </p>
      </div>

      <div>
        <h2>9. Changes and contact</h2>
        <p>
          We will give at least 30 days’ notice of material changes by email. Questions:{' '}
          <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">{SITE.email}</a>.
        </p>
      </div>
    </ProsePage>
  )
}
