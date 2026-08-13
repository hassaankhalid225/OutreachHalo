import type { Metadata } from 'next'

import { getConversations } from '@/lib/data/repo'
import type { IntentTag } from '@/lib/types'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { InboxView } from '@/components/app/inbox/inbox-view'

export const metadata: Metadata = { title: 'Inbox' }

type SearchParams = Record<string, string | string[] | undefined>

export default async function InboxPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const intent = (typeof params.intent === 'string' ? params.intent : 'all') as IntentTag | 'all'
  const search = typeof params.search === 'string' ? params.search : ''

  const conversations = await getConversations({ intent, search })
  const unread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  return (
    <>
      <PageHeader
        title="Inbox"
        description={
          unread > 0
            ? `${unread} unread. Sorted by who is ready to buy, not by who wrote last.`
            : 'Every reply from LinkedIn and email, classified by intent.'
        }
      />
      <PageBody className="pt-4">
        <InboxView conversations={conversations} />
      </PageBody>
    </>
  )
}
