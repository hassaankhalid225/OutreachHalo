import type { Metadata } from 'next'

import { FEATURE_PAGES } from '@/lib/content/pages'
import { PageHero, LinkCardGrid } from '@/components/marketing/page-templates'
import { Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Features — everything the agent does for you',
  description:
    'Prospecting, intent scoring, LinkedIn and email outreach, follow-ups, a unified reply inbox, autopilot closing and voice-matched content. One agent, one dashboard.',
  alternates: { canonical: '/features' },
}

export default function FeaturesIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title="One agent. The whole outbound and inbound loop."
        body="Seven capabilities that used to be seven tools and one very tired person. Each one works on its own; together they compound."
        secondary={{ label: 'See how it works', href: '/#how-it-works' }}
      />

      <Section className="py-8 md:py-12">
        <div className="container">
          <LinkCardGrid
            items={FEATURE_PAGES.map((page) => ({
              href: `/features/${page.slug}`,
              title: page.title,
              body: page.intro.slice(0, 150) + '…',
              badge: page.eyebrow,
            }))}
          />
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
