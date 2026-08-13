import type { Metadata } from 'next'

import { USE_CASE_PAGES } from '@/lib/content/pages'
import { PageHero, LinkCardGrid } from '@/components/marketing/page-templates'
import { Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Use cases — LinkedIn leads, cold email, inbound and replacing an SDR',
  description:
    'Five concrete jobs people hire OutreachHalo for, with realistic volume guidance and what a normal week looks like for each.',
  alternates: { canonical: '/use-cases' },
}

export default function UseCasesIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Use cases"
        title="Five jobs people hire this for."
        body="Each one includes the honest numbers — volumes, reply rates and what a normal week looks like — rather than a best-case screenshot."
      />

      <Section className="py-8 md:py-12">
        <div className="container">
          <LinkCardGrid
            items={USE_CASE_PAGES.map((page) => ({
              href: `/use-cases/${page.slug}`,
              title: page.title,
              body: page.intro.slice(0, 150) + '…',
            }))}
          />
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
