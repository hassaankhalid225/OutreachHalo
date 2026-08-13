import type { Metadata } from 'next'

import { getSequences } from '@/lib/data/repo'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { NewSequenceButton, SequencesList } from '@/components/app/sequences/sequences-list'

export const metadata: Metadata = { title: 'Sequences' }

export default async function SequencesPage() {
  const sequences = await getSequences()
  const active = sequences.filter((s) => s.status === 'active').length

  return (
    <>
      <PageHeader
        title="Sequences"
        description={`${active} of ${sequences.length} running. A reply on either channel stops the whole sequence.`}
        actions={<NewSequenceButton />}
      />
      <PageBody>
        <SequencesList sequences={sequences} />
      </PageBody>
    </>
  )
}
