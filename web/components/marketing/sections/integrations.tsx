import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'

import { INTEGRATIONS_SECTION } from '@/lib/content/site'
import { AI_AGENTS } from '@/components/brand/logos'
import { Reveal, RevealGroup, RevealItem, Section } from '@/components/marketing/reveal'

export function IntegrationsSection() {
  return (
    <Section id="integrations">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/40 px-6 py-14 md:px-14 md:py-16">
          <div aria-hidden className="glow-blob left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 -translate-y-1/2 bg-primary/15" />

          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow mb-5">{INTEGRATIONS_SECTION.eyebrow}</p>
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              {INTEGRATIONS_SECTION.headline}
            </h2>
            <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">{INTEGRATIONS_SECTION.body}</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={INTEGRATIONS_SECTION.primaryLink.href}
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary"
              >
                {INTEGRATIONS_SECTION.primaryLink.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span aria-hidden className="hidden text-muted-foreground/40 sm:inline">
                ·
              </span>
              <Link
                href={INTEGRATIONS_SECTION.secondaryLink.href}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <BookOpen className="size-4" />
                {INTEGRATIONS_SECTION.secondaryLink.label}
              </Link>
            </div>
          </Reveal>

          <RevealGroup className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" stagger={0.06}>
            {AI_AGENTS.map(({ name, Glyph }) => (
              <RevealItem key={name}>
                <div className="group flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card/60 px-3 py-5 transition-all duration-200 hover:border-primary/30 hover:bg-card">
                  <span className="size-9 overflow-hidden rounded-lg grayscale transition-all duration-300 group-hover:grayscale-0">
                    <Glyph />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    {name}
                  </span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </Section>
  )
}
