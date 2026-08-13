import type { Metadata } from 'next'
import { Check, Minus } from 'lucide-react'

import { PLAN_MATRIX, PRICING_SECTION } from '@/lib/content/pricing'
import { FAQS } from '@/lib/content/site'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { PricingSection } from '@/components/marketing/sections/pricing'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Pricing — from $59/month, 7-day free trial',
  description:
    'Pro $59/mo and Growth $100/mo, both with a 7-day free trial. Limits pause gracefully, reset on your own billing date, and cancelling takes two clicks.',
  alternates: { canonical: '/pricing' },
}

const BILLING_FAQS = FAQS.filter((faq) =>
  ['How does pricing work?', 'What happens when I hit my monthly limit?', 'Can I cancel anytime?'].includes(faq.q)
)

function MatrixCell({ value }: { value: string }) {
  if (value === '—') return <Minus className="size-4 text-muted-foreground/40" />
  if (value === 'Included')
    return (
      <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary/15">
        <Check className="size-3 text-primary" strokeWidth={3} />
      </span>
    )
  return <span className="text-sm text-foreground/85">{value}</span>
}

export default function PricingPage() {
  return (
    <>
      <PageHero eyebrow={PRICING_SECTION.eyebrow} title={PRICING_SECTION.headline} body={PRICING_SECTION.body} cta={null} />

      <PricingSection showHeading={false} />

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Compare every line</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Limits reset on your own billing date. Hit one and everything pauses — there is no overage invoice.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[38rem] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Feature
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Pro</th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-primary">Growth</th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">Custom</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAN_MATRIX.map((row) => (
                    <tr key={row.label} className="border-b border-border last:border-0 even:bg-secondary/20">
                      <td className="px-5 py-3.5 font-medium text-foreground/90">{row.label}</td>
                      {row.values.map((value, i) => (
                        <td key={i} className={i === 1 ? 'bg-primary/[0.04] px-5 py-3.5' : 'px-5 py-3.5'}>
                          <MatrixCell value={value} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </Section>

      <Section className="py-16 md:py-20">
        <div className="container">
          <Reveal className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">Billing questions</h2>
            <Accordion type="single" collapsible className="mt-8 space-y-3">
              {BILLING_FAQS.map((faq, i) => (
                <AccordionItem key={faq.q} value={`billing-${i}`}>
                  <AccordionTrigger className="text-sm md:text-base">{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
