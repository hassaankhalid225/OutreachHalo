import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

import { SOLUTION_BLOCKS, SOLUTION_INTRO } from '@/lib/content/site'
import { cn } from '@/lib/utils'
import { Reveal, Section, SectionHeading } from '@/components/marketing/reveal'
import { Mockup } from '@/components/mockups'

export function SolutionSection() {
  return (
    <Section id="solution" glow="top">
      <div className="container">
        <SectionHeading eyebrow="Solution" title={SOLUTION_INTRO.headline} body={SOLUTION_INTRO.body} />

        <div className="mt-20 space-y-24 md:space-y-32">
          {SOLUTION_BLOCKS.map((block, i) => {
            const flipped = i % 2 === 1

            return (
              <div
                key={block.headline}
                className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
              >
                <Reveal className={cn(flipped && 'lg:order-2')}>
                  <p className="eyebrow mb-5">{block.eyebrow}</p>
                  <h3 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl md:text-[2rem] md:leading-[1.15]">
                    {block.headline}
                  </h3>
                  <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{block.body}</p>

                  <ul className="mt-6 space-y-2.5">
                    {block.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary/15">
                          <Check className="size-3 text-primary" strokeWidth={3} />
                        </span>
                        <span className="text-foreground/80">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={block.href}
                    className="group mt-7 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    Learn more
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Reveal>

                <Reveal delay={0.12} className={cn('relative', flipped && 'lg:order-1')}>
                  <div
                    aria-hidden
                    className="glow-blob left-1/2 top-1/2 h-64 w-80 -translate-x-1/2 -translate-y-1/2 bg-primary/10"
                  />
                  <Mockup name={block.mockup} />
                </Reveal>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
