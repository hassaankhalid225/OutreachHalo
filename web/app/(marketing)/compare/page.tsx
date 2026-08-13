import type { Metadata } from 'next'

import { COMPARE_PAGES } from '@/lib/content/pages'
import { PageHero, LinkCardGrid } from '@/components/marketing/page-templates'
import { Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Compare — OutreachHalo vs the alternatives',
  description:
    'Honest side-by-side comparisons against Artisan, Apollo, Instantly and Clay, including when the other tool is the better buy.',
  alternates: { canonical: '/compare' },
}

export default function CompareIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Compare"
        title="Including the parts where they win."
        body="Every comparison here has a “when they win” section. If we only listed our own advantages you would rightly not believe any of it."
        secondary={{ label: 'See alternatives', href: '/alternatives' }}
      />

      <Section className="py-8 md:py-12">
        <div className="container">
          <LinkCardGrid
            columns={2}
            items={COMPARE_PAGES.map((page) => ({
              href: `/compare/${page.slug}`,
              title: page.title,
              body: page.positioning,
              badge: `vs ${page.competitor}`,
            }))}
          />
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
