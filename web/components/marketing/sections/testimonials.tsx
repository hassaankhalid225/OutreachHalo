'use client'

import { Quote } from 'lucide-react'

import { TESTIMONIALS, type Testimonial } from '@/lib/content/site'
import { PersonAvatar } from '@/components/ui/avatar'

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex w-[21rem] shrink-0 flex-col justify-between rounded-2xl border border-border bg-card/70 p-5 sm:w-[24rem]">
      <div>
        <Quote className="size-4 text-primary/60" aria-hidden />
        <blockquote className="mt-3 text-sm leading-relaxed text-foreground/90">“{item.quote}”</blockquote>
      </div>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        <PersonAvatar name={item.name} className="size-9" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {item.role}, {item.company}
          </p>
        </div>
        {item.metric && (
          <span className="shrink-0 rounded-full border border-positive/25 bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">
            {item.metric}
          </span>
        )}
      </figcaption>
    </figure>
  )
}

/**
 * Seamless marquee: the list is rendered twice and translated by exactly -50%,
 * so the loop point is invisible. Hovering pauses it.
 */
export function TestimonialMarquee() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS]

  return (
    <section className="relative py-10" aria-label="Customer testimonials">
      <div className="marquee-mask group overflow-hidden">
        <div
          className="flex w-max gap-4 animate-marquee group-hover:[animation-play-state:paused]"
          style={{ ['--marquee-duration' as string]: '52s' }}
        >
          {doubled.map((item, i) => (
            <TestimonialCard key={`${item.name}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  )
}
