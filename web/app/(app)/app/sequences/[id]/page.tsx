import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { getProspects, getSequenceDetail } from '@/lib/data/repo'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { SequenceBuilder } from '@/components/app/sequences/sequence-builder'

export const metadata: Metadata = { title: 'Sequence builder' }

export default async function SequenceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const detail = await getSequenceDetail(id)
  if (!detail) notFound()

  // A handful of real prospects power the merge-tag preview.
  const samples = await getProspects({ page_size: 6 })

  return (
    <>
      <PageHeader
        title={detail.sequence.name}
        description={detail.sequence.description ?? 'Edit the steps, then save. Changes apply to everyone still enrolled.'}
        actions={
          <Link
            href="/app/sequences"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All sequences
          </Link>
        }
      />
      <PageBody>
        <SequenceBuilder
          sequence={detail.sequence}
          prospects={detail.prospects}
          sampleProspects={samples.items}
        />
      </PageBody>
    </>
  )
}
