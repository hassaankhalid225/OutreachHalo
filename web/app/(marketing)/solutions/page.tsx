import type { Metadata } from 'next'

import { SOLUTION_PAGES } from '@/lib/content/pages'
import { PageHero, LinkCardGrid } from '@/components/marketing/page-templates'
import { Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Solutions — for founders, agencies, sales teams and startups',
  description:
    'The same agent, framed for how you actually sell. Pick the version that matches your team and see the first-90-days plan.',
  alternates: { canonical: '/solutions' },
}

export default function SolutionsIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Same agent. Four very different weeks."
        body="A founder, an agency owner and a sales manager all need pipeline — but almost nothing else about their week is the same. Pick yours."
      />

      <Section className="py-8 md:py-12">
        <div className="container">
          <LinkCardGrid
            columns={2}
            items={SOLUTION_PAGES.map((page) => ({
              href: `/solutions/${page.slug}`,
              title: page.title,
              body: page.intro.slice(0, 170) + '…',
              badge: page.eyebrow,
            }))}
          />
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
