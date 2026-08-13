import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'

import { PROVIDER_GLYPHS, PROVIDER_LABELS, type ProviderKey } from '@/components/brand/logos'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { IntegrationsSection } from '@/components/marketing/sections/integrations'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'Integrations — LinkedIn, Gmail, Outlook, Google Workspace and MCP',
  description:
    'Connect the accounts you already own. Sending happens from your real profile and mailbox, with per-account daily caps and one-click disconnect.',
  alternates: { canonical: '/integrations' },
}

const SENDING = {
  linkedin: {
    what: 'Prospect search and messaging from your own profile',
    detail: 'Connection notes and DMs, capped at a conservative daily limit and paced across your working hours.',
  },
  gmail: {
    what: 'Email steps sent from your Gmail account',
    detail: 'Your domain, your reputation. No shared IP pools and no rented sending domains.',
  },
  outlook: {
    what: 'Email steps sent from Outlook',
    detail: 'Same pacing and per-account caps as Gmail, with replies flowing into the same unified inbox.',
  },
  google_workspace: {
    what: 'Workspace-wide sending for teams',
    detail: 'Multiple seats sending under one workspace, each with its own cap and sending window.',
  },
} as const

export default function IntegrationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Integrations"
        title="Posts and sends from the accounts you already own."
        body="No burner profiles, no rented domains, no provisioned mailboxes nobody recognises. You connect what you already use, and you can disconnect it in one click."
        secondary={{ label: 'Set up MCP', href: '/mcp-server' }}
      />

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            {(Object.keys(PROVIDER_GLYPHS) as ProviderKey[]).map((key, i) => {
              const Glyph = PROVIDER_GLYPHS[key]
              return (
                <Reveal key={key} delay={(i % 2) * 0.08}>
                  <div className="h-full rounded-2xl border border-border bg-card/60 p-6">
                    <div className="flex items-center gap-3">
                      <span className="size-9 overflow-hidden rounded-lg">
                        <Glyph />
                      </span>
                      <h2 className="text-base font-semibold">{PROVIDER_LABELS[key]}</h2>
                    </div>
                    <p className="mt-4 text-sm font-medium text-foreground/85">{SENDING[key].what}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{SENDING[key].detail}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>

          <Reveal delay={0.15} className="mx-auto mt-10 flex max-w-4xl items-start gap-3.5 rounded-2xl border border-border bg-card/40 p-6">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-positive" />
            <div>
              <h2 className="text-sm font-semibold">Account safety is enforced, not promised</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every connected account has its own daily cap (default 25, hard maximum 100), sends are spread across the
                working window you set rather than fired in a burst, and disconnecting stops everything immediately —
                one click, no confirmation maze.{' '}
                <Link href="/features/linkedin-outreach-automation" className="text-primary hover:underline">
                  How sending works
                  <ArrowRight className="ml-1 inline size-3" />
                </Link>
              </p>
            </div>
          </Reveal>
        </div>
      </Section>

      <IntegrationsSection />
      <FinalCta />
    </>
  )
}
