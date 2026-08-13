import type { Metadata } from 'next'
import Link from 'next/link'

import { BLOG_POSTS } from '@/lib/content/pages'
import { formatDate } from '@/lib/utils'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Blog — outbound, intent signals and honest numbers',
  description:
    'Notes on what actually moves reply rates: intent signals, safe sending volumes, LinkedIn content that produces pipeline, and what an AI SDR can and cannot do.',
  alternates: { canonical: '/blog' },
}

export default function BlogIndexPage() {
  const [featured, ...rest] = [...BLOG_POSTS].sort((a, b) => +new Date(b.date) - +new Date(a.date))

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Numbers we can actually defend."
        body="Short posts about what moves reply rates, written from our own sending data rather than from a content calendar."
        cta={null}
      />

      <Section className="py-4 md:py-8">
        <div className="container">
          <Reveal className="mx-auto max-w-5xl">
            <Link
              href={`/blog/${featured.slug}`}
              className="group block overflow-hidden rounded-3xl border border-border bg-card/50 transition-all duration-200 hover:border-primary/30 hover:shadow-halo-lift"
            >
              <div className="grid gap-6 p-7 md:grid-cols-[minmax(0,1fr)_16rem] md:p-9">
                <div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                      {featured.category}
                    </span>
                    <time dateTime={featured.date}>{formatDate(featured.date)}</time>
                    <span>{featured.readingMinutes} min read</span>
                  </div>
                  <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight md:text-3xl">{featured.title}</h2>
                  <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                  <span className="mt-5 inline-block text-sm font-medium text-primary">Read the post →</span>
                </div>
                <div className="hidden items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-primary/15 to-transparent md:flex">
                  <span className="font-mono text-5xl font-semibold text-primary/40">01</span>
                </div>
              </div>
            </Link>
          </Reveal>

          <div className="mx-auto mt-6 grid max-w-5xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post, i) => (
              <Reveal key={post.slug} delay={(i % 3) * 0.07}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card/50 p-6 transition-all duration-200 hover:border-primary/30 hover:bg-card"
                >
                  <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-0.5">{post.category}</span>
                    <time dateTime={post.date}>{formatDate(post.date)}</time>
                  </div>
                  <h2 className="mt-3.5 text-base font-semibold leading-snug">{post.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                  <span className="mt-4 text-xs text-muted-foreground">{post.readingMinutes} min read</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
