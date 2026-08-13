import type { Metadata } from 'next'

import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'For AI agents — the OutreachHalo agent guide',
  description:
    'How an AI agent should think about driving OutreachHalo: the object model, the safe defaults, and the four actions that need a human.',
  alternates: { canonical: '/for-agents' },
}

const PROMPTS = [
  '“Show me every prospect above 85 fit who is hiring SDRs and is not yet in a sequence.”',
  '“Enrol those in the hot-signal sequence, approve-first.”',
  '“Draft replies for everything tagged interested, but do not send.”',
  '“Write next week’s two posts in my voice and schedule them for Tuesday and Thursday at 9am.”',
  '“What is my reply rate by signal type over the last 30 days?”',
]

const SECTIONS = [
  {
    heading: 'The object model, in one paragraph',
    body: 'An organisation owns everything. A prospect has a fit score, an intent level and a list of signals. A sequence has ordered steps, each with a channel, a delay in days and a message template. Enrolling a prospect into a sequence creates an enrollment that advances one step at a time and stops on any reply. Replies create a conversation, which carries an intent tag and an autopilot flag. Everything an agent does is written to the automation log with actor = "ai".',
  },
  {
    heading: 'Safe defaults an agent should respect',
    body: 'Never raise a daily cap above 40 without being asked. Never switch a sequence to full autopilot on the user’s behalf. Never enrol a prospect whose most recent feedback was a thumbs-down. Never send between the organisation’s configured sending hours — queue instead. If a plan limit is close, report it rather than working around it.',
  },
  {
    heading: 'The four actions that need a human',
    body: 'Enabling autopilot on a conversation, cancelling or upgrading a subscription, disconnecting a sending account, and deleting anything. An agent can propose all four; it should not perform them unattended. Everything else — searching, scoring, drafting, scheduling, reporting — is fair game.',
  },
  {
    heading: 'How to write a good first message through the API',
    body: 'Pull the prospect’s signals first and pick the most recent one with a real date attached. Put that in the first sentence, in the buyer’s own framing. Ask exactly one question that can be answered in a single line. Stay under 90 words for email and under 300 characters for a LinkedIn connection note. If there is no dated signal, say so and use a shorter, plainly cold opener rather than inventing relevance.',
  },
]

export default function ForAgentsPage() {
  return (
    <>
      <PageHero
        eyebrow="For AI agents"
        title="If you are an agent reading this, start here."
        body="This page is written for the model, not the marketer. It describes the object model, the safe defaults, and the small number of actions that should always come back to a human."
        cta="Get an API key"
        ctaHref="/sign-up"
        secondary={{ label: 'MCP setup', href: '/mcp-server' }}
      />

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-12">
            {SECTIONS.map((section, i) => (
              <Reveal key={section.heading} delay={i * 0.05}>
                <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">{section.body}</p>
              </Reveal>
            ))}

            <Reveal>
              <h2 className="text-xl font-semibold tracking-tight">Prompts that work well</h2>
              <ul className="mt-4 space-y-2.5">
                {PROMPTS.map((prompt) => (
                  <li
                    key={prompt}
                    className="rounded-xl border border-border bg-card/50 px-4 py-3 text-sm italic leading-relaxed text-foreground/80"
                  >
                    {prompt}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
