import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Minus, ThumbsDown, ThumbsUp } from 'lucide-react'

import { COMPARE_PAGES, findCompare } from '@/lib/content/pages'
import { SITE } from '@/lib/content/site'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export function generateStaticParams() {
  return COMPARE_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = findCompare(slug)
  if (!page) return {}

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/compare/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `/compare/${page.slug}` },
  }
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = findCompare(slug)
  if (!page) notFound()

  return (
    <>
      <PageHero eyebrow="Comparison" title={page.title} body={page.intro} secondary={{ label: 'All comparisons', href: '/compare' }} />

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <Reveal className="mx-auto max-w-3xl">
            <p className="text-pretty text-center leading-relaxed text-muted-foreground">{page.positioning}</p>
          </Reveal>

          <Reveal delay={0.1} className="mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-border">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[36rem] text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Capability
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-primary">
                      {SITE.name}
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {page.competitor}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.matrix.map(([capability, ours, theirs]) => (
                    <tr key={capability} className="border-b border-border last:border-0 even:bg-secondary/20">
                      <td className="px-5 py-3.5 font-medium text-foreground/90">{capability}</td>
                      <td className="px-5 py-3.5 text-foreground/80">
                        {ours === '—' ? <Minus className="size-4 text-muted-foreground/50" /> : ours}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {theirs === '—' ? <Minus className="size-4 text-muted-foreground/50" /> : theirs}
                      </td>
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
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-2xl border border-border bg-card/50 p-6">
                <span className="flex size-9 items-center justify-center rounded-xl bg-warm/15">
                  <ThumbsDown className="size-4 text-warm" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">When {page.competitor} is the better buy</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{page.whenTheyWin}</p>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="h-full rounded-2xl border border-primary/25 bg-primary/[0.06] p-6">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20">
                  <ThumbsUp className="size-4 text-primary" />
                </span>
                <h2 className="mt-4 text-lg font-semibold">When {SITE.name} is the better buy</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{page.whenWeWin}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
