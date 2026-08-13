import type { Metadata } from 'next'

import { TOOL_PAGES } from '@/lib/content/pages'
import { PageHero, LinkCardGrid } from '@/components/marketing/page-templates'
import { Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Free AI sales tools — cold email, LinkedIn posts, ICP and sequences',
  description:
    'Five free generators for cold emails, LinkedIn posts and messages, ideal customer profiles and full email sequences. No signup required.',
  alternates: { canonical: '/tools' },
}

export default function ToolsIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Free tools"
        title="Five generators. No signup, no email wall."
        body="These are the same generation prompts the product runs internally, exposed for free. Use them standalone or as a preview of what the agent writes from real buying signals."
        cta={null}
      />

      <Section className="py-8 md:py-12">
        <div className="container">
          <LinkCardGrid
            items={TOOL_PAGES.map((tool) => ({
              href: `/tools/${tool.slug}`,
              title: tool.name,
              body: tool.intro,
              badge: 'Free',
            }))}
          />
        </div>
      </Section>

      <FinalCta
        headline="The tools are free. The agent does it for you."
        body="These write one message at a time from what you type. The product writes one for every prospect from what actually changed at their company — then sends it."
      />
    </>
  )
}
