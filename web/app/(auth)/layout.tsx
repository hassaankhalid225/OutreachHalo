import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

import { isDemoMode } from '@/lib/env'
import { Logo } from '@/components/brand/logos'
import { PersonAvatar } from '@/components/ui/avatar'
import { HERO, TESTIMONIALS } from '@/lib/content/site'

const PROOF_POINTS = [
  'A scored prospect list waiting on your first login',
  'LinkedIn and email in one sequence, sent from your accounts',
  'Every reply in one inbox, sorted by who is ready to buy',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const testimonial = TESTIMONIALS[0]

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Form side */}
      <div className="relative flex flex-col px-6 py-8 sm:px-10">
        <div aria-hidden className="glow-blob left-1/4 top-0 h-72 w-96 bg-primary/10" />

        <div className="flex items-center justify-between">
          <Link href="/" aria-label="OutreachHalo home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">{children}</div>

        {isDemoMode && (
          <p className="mx-auto max-w-sm rounded-xl border border-warm/25 bg-warm/[0.07] px-3.5 py-2.5 text-center text-xs leading-relaxed text-muted-foreground">
            Running in demo mode — Supabase is not configured, so any email and password will sign you into a fully
            seeded workspace.
          </p>
        )}
      </div>

      {/* Proof side */}
      <div className="relative hidden overflow-hidden border-l border-border bg-card/30 lg:flex lg:flex-col lg:justify-center lg:px-14">
        <div aria-hidden className="absolute inset-0 grid-lines opacity-30" />
        <div aria-hidden className="glow-blob right-0 top-1/4 h-96 w-96 bg-primary/15" />

        <div className="relative max-w-md">
          <p className="eyebrow">{HERO.eyebrow}</p>
          <h2 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-tight">
            Your workspace is already full of work.
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            New accounts are seeded with a live pipeline — real prospects, running sequences and a populated inbox — so
            you can see what the agent does before you connect anything.
          </p>

          <ul className="mt-8 space-y-3">
            {PROOF_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Check className="size-3 text-primary" strokeWidth={3} />
                </span>
                <span className="text-foreground/80">{point}</span>
              </li>
            ))}
          </ul>

          <figure className="mt-12 rounded-2xl border border-border bg-card/70 p-5">
            <blockquote className="text-sm leading-relaxed text-foreground/85">“{testimonial.quote}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <PersonAvatar name={testimonial.name} className="size-8" />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{testimonial.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  )
}
