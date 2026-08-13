import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { FEATURE_PAGES, findFeature } from '@/lib/content/pages'
import { ContentPageTemplate } from '@/components/marketing/page-templates'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export function generateStaticParams() {
  return FEATURE_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const page = findFeature(slug)
  if (!page) return {}

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: { canonical: `/features/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `/features/${page.slug}` },
  }
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = findFeature(slug)
  if (!page) notFound()

  return (
    <>
      <ContentPageTemplate page={page} />
      <FinalCta />
    </>
  )
}
