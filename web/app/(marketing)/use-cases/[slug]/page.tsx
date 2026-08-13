import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { USE_CASE_PAGES, findUseCase } from '@/lib/content/pages'
import { ContentPageTemplate } from '@/components/marketing/page-templates'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export function generateStaticParams() {
  return USE_CASE_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = findUseCase(slug)
  if (!page) return {}

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/use-cases/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `/use-cases/${page.slug}` },
  }
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = findUseCase(slug)
  if (!page) notFound()

  return (
    <>
      <ContentPageTemplate page={page} />
      <FinalCta />
    </>
  )
}
