import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'

import { BLOG_POSTS, findPost } from '@/lib/content/pages'
import { SITE } from '@/lib/content/site'
import { formatDate } from '@/lib/utils'
import { PersonAvatar } from '@/components/ui/avatar'
import { Reveal, Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) return {}

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.metaTitle,
      description: post.metaDescription,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      authors: [post.author],
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = findPost(slug)
  if (!post) notFound()

  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: SITE.name },
    mainEntityOfPage: `${SITE.url}/blog/${post.slug}`,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article>
        <Section className="pb-8 pt-14 md:pb-10 md:pt-20">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
                All posts
              </Link>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                  {post.category}
                </span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span>{post.readingMinutes} min read</span>
              </div>

              <h1 className="mt-5 text-balance text-3xl font-semibold leading-[1.12] tracking-tight sm:text-4xl md:text-[2.75rem]">
                {post.title}
              </h1>

              <div className="mt-7 flex items-center gap-3 border-y border-border py-4">
                <PersonAvatar name={post.author} className="size-9" />
                <div>
                  <p className="text-sm font-medium">{post.author}</p>
                  <p className="text-xs text-muted-foreground">Founder, {SITE.name}</p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        <Section className="py-4 md:py-8">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-10">
              {post.body.map((section, i) => (
                <Reveal key={section.heading} delay={Math.min(i, 4) * 0.04}>
                  <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{section.heading}</h2>
                  <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{section.body}</p>
                  {section.bullets && (
                    <ul className="mt-5 space-y-2.5">
                      {section.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2.5 text-sm">
                          <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary/15">
                            <Check className="size-3 text-primary" strokeWidth={3} />
                          </span>
                          <span className="text-foreground/80">{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      </article>

      <Section className="border-t border-border bg-card/20 py-14">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-lg font-semibold tracking-tight">Keep reading</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {related.map((other) => (
                <Link
                  key={other.slug}
                  href={`/blog/${other.slug}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card/50 p-5 transition-all duration-200 hover:border-primary/30 hover:bg-card"
                >
                  <span className="text-[11px] text-muted-foreground">{other.category}</span>
                  <h3 className="mt-2 text-sm font-semibold leading-snug">{other.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{other.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
