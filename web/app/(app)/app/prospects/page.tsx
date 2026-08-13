import { Suspense } from 'react'
import type { Metadata } from 'next'

import { getProspects, getSequences, getSignalOptions } from '@/lib/data/repo'
import type { IntentLevel, ProspectSource, SequenceStatus } from '@/lib/types'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { ProspectsView } from '@/components/app/prospects/prospects-view'
import { Skeleton } from '@/components/ui/misc'

export const metadata: Metadata = { title: 'Prospects' }

type SearchParams = Record<string, string | string[] | undefined>

const toArray = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : Array.isArray(value) ? value : [value]

export default async function ProspectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams

  const filters = {
    fit_min: Number(params.fit_min ?? 0),
    fit_max: Number(params.fit_max ?? 100),
    intent: toArray(params.intent) as IntentLevel[],
    signal: toArray(params.signal),
    seq_status: (params.seq_status as SequenceStatus | 'all') ?? 'all',
    source: (params.source as ProspectSource | 'all') ?? 'all',
    search: typeof params.search === 'string' ? params.search : '',
    page: Number(params.page ?? 1),
    page_size: 12,
  }

  const [page, signalOptions, sequences] = await Promise.all([
    getProspects(filters),
    getSignalOptions(),
    getSequences(),
  ])

  return (
    <>
      <PageHeader
        title="Prospects"
        description={`${page.total} people matching your ideal customer, scored and ranked by intent.`}
      />

      <PageBody>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <ProspectsView page={page} signalOptions={signalOptions} sequences={sequences} />
        </Suspense>
      </PageBody>
    </>
  )
}
