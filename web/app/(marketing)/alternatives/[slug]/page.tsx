import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'

import { ALTERNATIVE_PAGES, findAlternative } from '@/lib/content/pages'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export function generateStaticParams() {
  return ALTERNATIVE_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = findAlternative(slug)
  if (!page) return {}

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/alternatives/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `/alternatives/${page.slug}` },
  }
}

export default async function AlternativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = findAlternative(slug)
  if (!page) notFound()

  return (
    <>
      <PageHero
        eyebrow="Alternative"
        title={page.title}
        body={page.intro}
        secondary={{ label: 'All alternatives', href: '/alternatives' }}
      />

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:grid-cols-4">
            {page.reasons.map((reason, i) => (
              <Reveal key={reason.title} delay={i * 0.07}>
                <div className="h-full rounded-2xl border border-border bg-card/60 p-6">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/15">
                    <Check className="size-4 text-primary" strokeWidth={3} />
                  </span>
                  <h2 className="mt-4 text-base font-semibold">{reason.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.15} className="mx-auto mt-12 max-w-3xl rounded-2xl border border-primary/25 bg-primary/[0.06] p-7 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">The verdict</p>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">{page.verdict}</p>
          </Reveal>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
