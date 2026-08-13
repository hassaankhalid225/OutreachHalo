import type { Metadata } from 'next'

import { ALTERNATIVE_PAGES } from '@/lib/content/pages'
import { PageHero, LinkCardGrid } from '@/components/marketing/page-templates'
import { Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Alternatives — switching from Apollo, Instantly or Artisan',
  description:
    'Why teams switch, what actually changes, and the cases where you should stay exactly where you are.',
  alternates: { canonical: '/alternatives' },
}

export default function AlternativesIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Alternatives"
        title="Switching is a cost. Here is when it is worth it."
        body="Each page names the specific trigger that usually sends people looking, and the case where switching would be a mistake."
        secondary={{ label: 'See comparisons', href: '/compare' }}
      />

      <Section className="py-8 md:py-12">
        <div className="container">
          <LinkCardGrid
            columns={2}
            items={ALTERNATIVE_PAGES.map((page) => ({
              href: `/alternatives/${page.slug}`,
              title: page.title,
              body: page.intro,
            }))}
          />
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
