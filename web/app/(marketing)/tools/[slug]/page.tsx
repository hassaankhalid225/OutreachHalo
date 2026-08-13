import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Lightbulb } from 'lucide-react'

import { TOOL_PAGES, findTool } from '@/lib/content/pages'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { ToolForm } from '@/components/marketing/tool-form'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export function generateStaticParams() {
  return TOOL_PAGES.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const tool = findTool(slug)
  if (!tool) return {}

  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: { title: tool.metaTitle, description: tool.metaDescription, url: `/tools/${tool.slug}` },
  }
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const tool = findTool(slug)
  if (!tool) notFound()

  const others = TOOL_PAGES.filter((t) => t.slug !== tool.slug)

  return (
    <>
      <PageHero eyebrow="Free tool" title={tool.title} body={tool.intro} cta={null} />

      <Section className="py-4 md:py-8">
        <div className="container">
          <Reveal className="mx-auto max-w-5xl">
            <ToolForm tool={tool} />
          </Reveal>
        </div>
      </Section>

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <Reveal>
              <h2 className="text-xl font-semibold tracking-tight">What makes this one work</h2>
              <ul className="mt-5 space-y-3">
                {tool.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-3 rounded-xl border border-border bg-card/50 px-4 py-3">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-warm" />
                    <span className="text-sm leading-relaxed text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Other free tools</h2>
              <ul className="mt-4 space-y-1.5">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/tools/${other.slug}`}
                      className="block rounded-xl border border-border bg-card/40 px-4 py-3 text-sm transition-colors hover:border-primary/30 hover:text-primary"
                    >
                      {other.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
