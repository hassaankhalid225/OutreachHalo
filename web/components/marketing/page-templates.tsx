import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

import type { ContentPage } from '@/lib/content/pages'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Reveal, Section } from '@/components/marketing/reveal'
import { Mockup, type MockupName } from '@/components/mockups'

/** Standard sub-page hero. Every non-home marketing route opens with this. */
export function PageHero({
  eyebrow,
  title,
  body,
  cta = 'Start free trial',
  ctaHref = '/sign-up',
  secondary,
  children,
}: {
  eyebrow?: string
  title: string
  body: string
  cta?: string | null
  ctaHref?: string
  secondary?: { label: string; href: string }
  children?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96 grid-lines opacity-30" />
        <div className="glow-blob left-1/2 top-[-8rem] h-[24rem] w-[42rem] -translate-x-1/2 bg-primary/15" />
      </div>

      <div className="container">
        <Reveal className="mx-auto max-w-3xl text-center">
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-display-md">
            <span className="text-gradient">{title}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            {body}
          </p>

          {cta && (
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={ctaHref}>
                  {cta}
                  <ArrowRight />
                </Link>
              </Button>
              {secondary && (
                <Button asChild variant="outline" size="lg">
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              )}
            </div>
          )}
        </Reveal>

        {children}
      </div>
    </section>
  )
}

/** Renders a `ContentPage` — used by /features, /solutions and /use-cases. */
export function ContentPageTemplate({ page }: { page: ContentPage }) {
  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} body={page.intro} secondary={{ label: 'See pricing', href: '/pricing' }}>
        {page.mockup && (
          <Reveal delay={0.15} className="relative mx-auto mt-16 max-w-lg">
            <div aria-hidden className="glow-blob left-1/2 top-1/2 h-64 w-80 -translate-x-1/2 -translate-y-1/2 bg-primary/15" />
            <Mockup name={page.mockup as MockupName} />
          </Reveal>
        )}
      </PageHero>

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <div className="grid gap-5 md:grid-cols-3">
            {page.bullets.map((bullet, i) => (
              <Reveal key={bullet.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-border bg-card/60 p-6">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
                    <Check className="size-4 text-primary" strokeWidth={3} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{bullet.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{bullet.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <Section className="py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-14">
            {page.sections.map((section, i) => (
              <Reveal key={section.heading} delay={i * 0.05}>
                <h2 className="text-2xl font-semibold tracking-tight">{section.heading}</h2>
                <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{section.body}</p>
                {section.bullets && (
                  <ul className="mt-5 space-y-2.5">
                    {section.bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary/15">
                          <Check className="size-3 text-primary" strokeWidth={3} />
                        </span>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Reveal>
            ))}

            {page.faq && page.faq.length > 0 && (
              <Reveal>
                <h2 className="text-2xl font-semibold tracking-tight">Questions</h2>
                <Accordion type="single" collapsible className="mt-6 space-y-3">
                  {page.faq.map((faq, i) => (
                    <AccordionItem key={faq.q} value={`faq-${i}`}>
                      <AccordionTrigger className="text-sm md:text-base">{faq.q}</AccordionTrigger>
                      <AccordionContent>{faq.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Reveal>
            )}
          </div>
        </div>
      </Section>
    </>
  )
}

/** Card grid used by every index page (/features, /solutions, /tools…). */
export function LinkCardGrid({
  items,
  columns = 3,
}: {
  items: { href: string; title: string; body: string; badge?: string }[]
  columns?: 2 | 3
}) {
  return (
    <div className={cn('grid gap-5', columns === 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2')}>
      {items.map((item, i) => (
        <Reveal key={item.href} delay={(i % 3) * 0.07}>
          <Link
            href={item.href}
            className="group flex h-full flex-col rounded-2xl border border-border bg-card/50 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-card hover:shadow-halo-lift"
          >
            {item.badge && (
              <span className="mb-3 w-fit rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                {item.badge}
              </span>
            )}
            <h3 className="text-base font-semibold">{item.title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Read more
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  )
}

/** Long-form legal / policy page shell. */
export function ProsePage({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <Section className="py-16 md:py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated {updated}</p>
          <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_strong]:text-foreground [&_ul]:mt-3 [&_ul]:space-y-1.5">
            {children}
          </div>
        </div>
      </div>
    </Section>
  )
}
