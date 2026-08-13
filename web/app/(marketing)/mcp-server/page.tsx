import type { Metadata } from 'next'
import { Terminal } from 'lucide-react'

import { SITE } from '@/lib/content/site'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { AI_AGENTS } from '@/components/brand/logos'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'MCP server — run your pipeline from Claude, ChatGPT or Cursor',
  description:
    'Connect OutreachHalo to any MCP-capable AI agent and ask for leads, launch sequences, schedule posts and check reply rates in natural language.',
  alternates: { canonical: '/mcp-server' },
}

const TOOLS = [
  { name: 'list_prospects', desc: 'Filter by fit score, intent level, signal type or sequence status.' },
  { name: 'get_prospect', desc: 'Full signal breakdown, message history and current sequence step.' },
  { name: 'create_sequence', desc: 'Build a multi-step LinkedIn + email sequence with merge tags.' },
  { name: 'enroll_prospects', desc: 'Add a filtered set of prospects to a sequence in one call.' },
  { name: 'list_inbox', desc: 'Replies grouped by intent tag, newest first.' },
  { name: 'draft_reply', desc: 'Generate a reply from conversation history plus the prospect’s signals.' },
  { name: 'generate_post', desc: 'Voice-matched LinkedIn post from your stored writing sample.' },
  { name: 'schedule_post', desc: 'Queue a post for a specific date and time.' },
  { name: 'get_stats', desc: 'Reply rate, meetings booked and usage against your plan limits.' },
]

const CONFIG = `{
  "mcpServers": {
    "outreachhalo": {
      "command": "npx",
      "args": ["-y", "@outreachhalo/mcp"],
      "env": {
        "OUTREACHHALO_API_KEY": "oh_live_..."
      }
    }
  }
}`

export default function McpServerPage() {
  return (
    <>
      <PageHero
        eyebrow="MCP server"
        title="Run your pipeline from the agent you already use."
        body="OutreachHalo exposes its whole surface over the Model Context Protocol, so Claude, ChatGPT, Cursor or any MCP-capable agent can query prospects, launch sequences and schedule posts on your behalf. Included on every plan."
        cta="Get your API key"
        ctaHref="/sign-up"
        secondary={{ label: 'Read the agent guide', href: '/for-agents' }}
      />

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight">Set up in 2 minutes</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Generate an API key in Settings, drop this into your agent’s MCP config, and restart it. The tools appear
                automatically.
              </p>
              {/* Deliberately dark on a light page — a config block should read as
                  a terminal, and the contrast makes it the section's focal point. */}
              <div className="mt-6 overflow-hidden rounded-2xl bg-[#141221] shadow-halo">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                  <Terminal className="size-3.5 text-white/50" />
                  <span className="font-mono text-xs text-white/50">claude_desktop_config.json</span>
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-white/85">
                  <code>{CONFIG}</code>
                </pre>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {AI_AGENTS.map(({ name, Glyph }) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 py-1.5 pl-1.5 pr-3 text-xs text-muted-foreground"
                  >
                    <span className="size-5 overflow-hidden rounded">
                      <Glyph />
                    </span>
                    {name}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="text-2xl font-semibold tracking-tight">Exposed tools</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Nine tools covering the full loop. Every call is scoped to your workspace by the API key — an agent can
                never reach another tenant’s data.
              </p>
              <ul className="mt-6 space-y-2.5">
                {TOOLS.map((tool) => (
                  <li key={tool.name} className="rounded-xl border border-border bg-card/50 px-4 py-3">
                    <code className="font-mono text-xs text-primary">{tool.name}</code>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tool.desc}</p>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.2} className="mx-auto mt-12 max-w-3xl rounded-2xl border border-warm/25 bg-warm/[0.06] p-6">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-warm">Roadmap status</p>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              The MCP server is documented here and its tool contracts are final, but the published npm package ships
              alongside the real LinkedIn and email integrations in Phase 2. The REST API that backs it is live today —
              email{' '}
              <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">
                {SITE.email}
              </a>{' '}
              for early access.
            </p>
          </Reveal>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
