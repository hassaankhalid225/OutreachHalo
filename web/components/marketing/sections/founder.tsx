import { Mail } from 'lucide-react'

import { FOUNDER } from '@/lib/content/site'
import { PersonAvatar } from '@/components/ui/avatar'
import { Reveal, Section } from '@/components/marketing/reveal'

export function FounderSection() {
  return (
    <Section id="founder" className="border-y border-border bg-card/20">
      <div className="container">
        <Reveal className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <PersonAvatar name={FOUNDER.name} className="size-20 ring-4 ring-primary/15" />
            <div>
              <p className="text-base font-semibold">{FOUNDER.name}</p>
              <p className="text-sm text-muted-foreground">{FOUNDER.role}</p>
            </div>
          </div>

          <blockquote className="mt-10 text-balance text-center text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
            “{FOUNDER.pullQuote}”
          </blockquote>

          <div className="mt-10 space-y-5 text-pretty leading-relaxed text-muted-foreground">
            {FOUNDER.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href={`mailto:${FOUNDER.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Mail className="size-4" />
              {FOUNDER.email}
            </a>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
