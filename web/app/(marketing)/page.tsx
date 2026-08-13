import type { Metadata } from 'next'

import { SITE } from '@/lib/content/site'
import { Hero } from '@/components/marketing/sections/hero'
import { TestimonialMarquee } from '@/components/marketing/sections/testimonials'
import { ProblemSection } from '@/components/marketing/sections/problem'
import { SolutionSection } from '@/components/marketing/sections/solution'
import { HowItWorksSection } from '@/components/marketing/sections/how-it-works'
import { IntegrationsSection } from '@/components/marketing/sections/integrations'
import { PricingSection } from '@/components/marketing/sections/pricing'
import { FounderSection } from '@/components/marketing/sections/founder'
import { FaqSection, FaqJsonLd } from '@/components/marketing/sections/faq'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: `${SITE.name} — Turn LinkedIn into your best salesperson`,
  description: SITE.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE.name} — Turn LinkedIn into your best salesperson`,
    description: SITE.description,
    url: SITE.url,
  },
}

function OrganizationJsonLd() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: SITE.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: SITE.description,
    url: SITE.url,
    offers: [
      { '@type': 'Offer', name: 'Pro', price: '59', priceCurrency: 'USD' },
      { '@type': 'Offer', name: 'Growth', price: '100', priceCurrency: 'USD' },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
}

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <FaqJsonLd />

      <Hero />
      <TestimonialMarquee />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <PricingSection />
      <FounderSection />
      <FaqSection />
      <FinalCta />
    </>
  )
}
