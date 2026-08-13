import type { Metadata } from 'next'

import { SITE } from '@/lib/content/site'
import { PageHero } from '@/components/marketing/page-templates'
import { Reveal, Section } from '@/components/marketing/reveal'
import { FounderSection } from '@/components/marketing/sections/founder'
import { FinalCta } from '@/components/marketing/sections/final-cta'

export const metadata: Metadata = {
  title: 'About — why we built an AI sales agent',
  description:
    'OutreachHalo exists because outbound stops the moment delivery gets busy. Here is what we believe about how it should work.',
  alternates: { canonical: '/about' },
}

const BELIEFS = [
  {
    title: 'Timing beats volume',
    body: 'Sending twice as many messages doubles the noise. Sending the same number in the fortnight after something changed at the company is what actually moves reply rates.',
  },
  {
    title: 'It should send from your account',
    body: 'A message from a profile with your face on it gets read. A message from a provisioned mailbox nobody recognises gets filtered. That is not a feature decision, it is the whole thing.',
  },
  {
    title: 'You choose the leash',
    body: 'Approve every message, approve the first one, or let it run. Any product that cannot be run in full manual mode is asking for trust it has not earned yet.',
  },
  {
    title: 'No surprise invoices',
    body: 'Hitting a limit pauses the agent. It does not generate an overage charge. A vendor whose revenue rises when you lose track of your usage has the wrong incentive.',
  },
  {
    title: 'Honest comparisons',
    body: 'Every comparison page on this site has a section explaining when the other product is the better buy. If we only listed our advantages, none of it would be worth reading.',
  },
  {
    title: 'Ship the boring safety work',
    body: 'Daily caps, working-hours pacing, one-click disconnect and a full automation log are not exciting. They are the reason you can leave it running.',
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Built by someone who kept forgetting to do outbound."
        body="OutreachHalo started as an internal tool for an agency that kept losing its pipeline every time a big project landed. It still runs that agency’s pipeline today."
        secondary={{ label: 'Read the blog', href: '/blog' }}
      />

      <Section className="border-t border-border bg-card/20 py-16 md:py-20">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Six things we believe</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              These shape what gets built and, more usefully, what does not.
            </p>
          </Reveal>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {BELIEFS.map((belief, i) => (
              <Reveal key={belief.title} delay={(i % 3) * 0.07}>
                <div className="h-full rounded-2xl border border-border bg-card/60 p-6">
                  <span className="text-xs font-mono text-primary">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 text-base font-semibold">{belief.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{belief.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      <FounderSection />

      <Section className="py-16 md:py-20">
        <div className="container">
          <Reveal className="mx-auto max-w-2xl rounded-2xl border border-border bg-card/50 p-7 text-center">
            <h2 className="text-lg font-semibold">Talk to us</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
              Product questions, a bug, or a comparison page you think is unfair — all of it goes to the same inbox and
              gets answered by a person.
            </p>
            <a href={`mailto:${SITE.email}`} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              {SITE.email}
            </a>
          </Reveal>
        </div>
      </Section>

      <FinalCta />
    </>
  )
}
