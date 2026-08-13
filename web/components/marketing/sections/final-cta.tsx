import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { FINAL_CTA } from '@/lib/content/site'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/marketing/reveal'

export function FinalCta({
  headline = FINAL_CTA.headline,
  body = FINAL_CTA.body,
  cta = FINAL_CTA.cta,
  href = '/sign-up',
}: {
  headline?: string
  body?: string
  cta?: string
  href?: string
}) {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/[0.18] via-card to-card px-6 py-16 text-center md:px-16 md:py-20">
            <div aria-hidden className="glow-blob left-1/2 top-0 h-72 w-[40rem] -translate-x-1/2 -translate-y-1/2 bg-primary/20" />
            <div aria-hidden className="absolute inset-0 -z-10 grid-lines opacity-60" />

            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl md:leading-[1.08]">
              {headline}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty leading-relaxed text-muted-foreground">{body}</p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="xl" className="w-full sm:w-auto">
                <Link href={href}>
                  {cta}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
                <Link href="/pricing">See pricing</Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              7-day free trial · No credit card required to start · Cancel in two clicks
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
