import type { Metadata } from 'next'

import { SITE } from '@/lib/content/site'
import { ProsePage } from '@/components/marketing/page-templates'

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${SITE.name} collects, uses, stores and deletes personal data, including data from your connected LinkedIn and email accounts.`,
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy policy" updated="1 August 2026">
      <p>
        This policy explains what {SITE.name} (“we”) collects, why, how long we keep it, and how you get rid of it. It
        covers both the marketing site and the authenticated product.
      </p>

      <div>
        <h2>1. What we collect</h2>
        <ul>
          <li>
            <strong>Account data</strong> — your name, email address and workspace name, created when you sign up.
          </li>
          <li>
            <strong>Business profile data</strong> — the website URL you submit during onboarding and the summary derived
            from its public content.
          </li>
          <li>
            <strong>Connected account data</strong> — OAuth tokens and metadata for the LinkedIn, Gmail, Outlook or Google
            Workspace accounts you connect, plus the messages sent and received through them.
          </li>
          <li>
            <strong>Prospect data</strong> — names, titles, employers and public activity of people surfaced by searches
            run against your connected accounts.
          </li>
          <li>
            <strong>Usage data</strong> — pages viewed, features used, and aggregate counts against your plan limits.
          </li>
        </ul>
      </div>

      <div>
        <h2>2. What we do not collect</h2>
        <p>
          We do not sell data, we do not build a cross-customer contact database out of your prospects, and we do not use
          the contents of your messages to train models. Prospect data surfaced in your workspace stays in your
          workspace.
        </p>
      </div>

      <div>
        <h2>3. Legal basis (GDPR)</h2>
        <p>
          We process account and connected-account data to perform our contract with you. We process prospect data under
          legitimate interest — specifically, business-to-business communication with professionals in their professional
          capacity, using information they have made publicly available on a professional network. You remain the
          controller of who you contact and are responsible for honouring objections and opt-outs.
        </p>
      </div>

      <div>
        <h2>4. Sub-processors</h2>
        <ul>
          <li>Supabase — database, authentication and file storage</li>
          <li>Anthropic — model inference for message, post and analysis generation</li>
          <li>Stripe — payment processing (we never see or store your card details)</li>
          <li>Vercel and Railway — application hosting</li>
        </ul>
        <p>
          Prompts sent to our model provider are not used to train their models under our commercial terms.
        </p>
      </div>

      <div>
        <h2>5. Retention</h2>
        <p>
          Active workspace data is kept while your account is open. Deleting your account removes your workspace,
          prospects, messages and connected-account tokens within 30 days, except where we are legally required to keep
          billing records (7 years). Disconnecting an account revokes its tokens immediately.
        </p>
      </div>

      <div>
        <h2>6. Your rights</h2>
        <p>
          Access, correction, export, deletion, restriction and objection. Export is available in-product as CSV; for
          everything else email <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">{SITE.email}</a>{' '}
          and we will respond within 30 days. If you are in the EU or UK, you may also complain to your local supervisory
          authority.
        </p>
      </div>

      <div>
        <h2>7. Security</h2>
        <p>
          Data is encrypted in transit and at rest. Every tenant table is isolated at the database level by row-level
          security, so a query can only ever return rows belonging to the caller’s workspace. Access to production is
          limited and logged.
        </p>
      </div>

      <div>
        <h2>8. Cookies</h2>
        <p>
          We use a session cookie for authentication, a preference cookie for the promotional countdown, and privacy-
          respecting aggregate analytics. No advertising or cross-site tracking cookies are set.
        </p>
      </div>

      <div>
        <h2>9. Contact</h2>
        <p>
          Questions about this policy: <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">{SITE.email}</a>.
        </p>
      </div>
    </ProsePage>
  )
}
