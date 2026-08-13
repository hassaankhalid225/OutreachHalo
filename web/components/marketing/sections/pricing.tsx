import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'

import { PLANS, PRICING_SECTION } from '@/lib/content/pricing'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Reveal, Section, SectionHeading } from '@/components/marketing/reveal'

export function PricingSection({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <Section id="pricing" glow="top">
      <div className="container">
        {showHeading && (
          <SectionHeading
            eyebrow={PRICING_SECTION.eyebrow}
            title={PRICING_SECTION.headline}
            body={PRICING_SECTION.body}
          />
        )}

        <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3 lg:gap-6">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-3xl border p-7 transition-all duration-300',
                  plan.highlight
                    ? 'border-primary/40 bg-card shadow-halo-lift lg:-mt-4 lg:mb-[-1rem] lg:py-11'
                    : 'border-border bg-card/50 hover:border-border/70'
                )}
              >
                {plan.ribbon && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3.5 py-1 text-xs font-semibold text-primary-foreground shadow-glow">
                    <Sparkles className="size-3" />
                    {plan.ribbon}
                  </span>
                )}

                <h3 className="text-lg font-semibold">{plan.name}</h3>

                <div className="mt-4 flex items-baseline gap-2">
                  {plan.price === null ? (
                    <span className="text-4xl font-semibold tracking-tight">Talk with us</span>
                  ) : (
                    <>
                      {plan.listPrice && (
                        <span className="text-lg text-muted-foreground/60 line-through">${plan.listPrice}</span>
                      )}
                      <span className="text-5xl font-semibold tracking-tight tabular-nums">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                    </>
                  )}
                </div>

                <p className="mt-4 min-h-[3.5rem] text-sm leading-relaxed text-muted-foreground">{plan.blurb}</p>

                <Button
                  asChild
                  size="lg"
                  variant={plan.highlight ? 'default' : 'secondary'}
                  className="mt-6 w-full"
                >
                  <Link href={plan.ctaHref} {...(plan.id === 'custom' ? { target: '_blank', rel: 'noreferrer' } : {})}>
                    {plan.cta}
                  </Link>
                </Button>

                <div className="mt-7 border-t border-border pt-6">
                  {plan.inheritsFrom && (
                    <p className="mb-3.5 text-xs font-medium text-foreground">Everything in {plan.inheritsFrom}, plus</p>
                  )}
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm">
                        <span
                          className={cn(
                            'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full',
                            plan.highlight ? 'bg-primary/20' : 'bg-secondary'
                          )}
                        >
                          <Check className={cn('size-3', plan.highlight ? 'text-primary' : 'text-foreground/70')} strokeWidth={3} />
                        </span>
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-muted-foreground">
            {PRICING_SECTION.smallPrint}
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
