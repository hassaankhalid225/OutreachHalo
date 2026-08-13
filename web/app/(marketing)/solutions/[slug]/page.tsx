import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SOLUTION_PAGES, findSolution } from '@/lib/content/pages'
import { ContentPageTemplate } from '@/components/marketing/page-templates'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export function generateStaticParams() {
  return SOLUTION_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = findSolution(slug)
  if (!page) return {}

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/solutions/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `/solutions/${page.slug}` },
  }
}

export default async function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = findSolution(slug)
  if (!page) notFound()

  return (
    <>
      <ContentPageTemplate page={page} />
      <FinalCta />
    </>
  )
}
