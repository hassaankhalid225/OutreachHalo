import type { Metadata } from 'next'

import { getPosts, getVoiceSample } from '@/lib/data/repo'
import { PageBody, PageHeader } from '@/components/app/page-header'
import { ContentView } from '@/components/app/content/content-view'

export const metadata: Metadata = { title: 'Content' }

export default async function ContentPage() {
  const [posts, voice] = await Promise.all([getPosts(), getVoiceSample()])

  const scheduled = posts.filter((p) => p.status === 'scheduled').length
  const leads = posts.reduce((sum, p) => sum + p.leads_generated_count, 0)

  return (
    <>
      <PageHeader
        title="Content"
        description={`${scheduled} scheduled · ${leads} leads created from published posts so far.`}
      />
      <PageBody>
        <ContentView posts={posts} hasVoiceSample={Boolean(voice)} />
      </PageBody>
    </>
  )
}
