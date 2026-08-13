import type { Metadata } from 'next'
import { Radar } from 'lucide-react'

import { INDUSTRIES } from '@/lib/content/pages'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Industries — the buying signal that matters in your market',
  description:
    'Eight verticals and the single intent signal that predicts a reply best in each one, from open sales roles to announced office moves.',
  alternates: { canonical: '/industries' },
}

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Every market has one signal that beats the rest."
        body="The mechanics are identical across verticals. What changes is which of the 18 tracked signals actually predicts a reply — so start with the one that matches your market."
        secondary={{ label: 'See solutions', href: '/solutions' }}
      />

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {INDUSTRIES.map((industry, i) => (
              <Reveal key={industry.name} delay={(i % 4) * 0.07}>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-card/60 p-6">
                  <h2 className="text-base font-semibold">{industry.name}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{industry.body}</p>
                  <div className="mt-5 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/[0.07] px-3 py-2.5">
                    <Radar className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-primary">Lead signal</p>
                      <p className="mt-0.5 text-xs text-foreground/80">{industry.signal}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
