'use client'

import * as React from 'react'
import { motion, useInView } from 'framer-motion'
import { Infinity as InfinityIcon } from 'lucide-react'

import { PROBLEM } from '@/lib/content/site'
import { Reveal, Section } from '@/components/marketing/reveal'

const MAX_HOURS = 6

export function ProblemSection() {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <Section id="problem" className="border-y border-border bg-card/20">
      <div className="container">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-5">{PROBLEM.eyebrow}</p>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
            {PROBLEM.headline}
          </h2>
          <p className="mt-4 text-lg font-medium text-foreground/70">{PROBLEM.subhead}</p>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            {PROBLEM.body}
          </p>
        </Reveal>

        <div ref={ref} className="mx-auto mt-14 max-w-3xl">
          <ul className="space-y-3">
            {PROBLEM.rows.map((row, i) => {
              const infinite = !Number.isFinite(row.hours)
              const width = infinite ? 100 : (row.hours / MAX_HOURS) * 100

              return (
                <li key={row.label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-4">
                    <span className="text-sm text-foreground/90">{row.label}</span>
                    <span className="shrink-0 font-mono text-sm tabular-nums text-muted-foreground">
                      {infinite ? (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <InfinityIcon className="size-4" aria-label="infinite" /> hrs
                        </span>
                      ) : (
                        `${row.hours} hrs`
                      )}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={inView ? { width: `${width}%` } : { width: 0 }}
                      transition={{ duration: 0.9, delay: 0.1 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
                      className={
                        infinite
                          ? 'h-full rounded-full bg-gradient-to-r from-primary/60 via-primary to-primary/20'
                          : 'h-full rounded-full bg-gradient-to-r from-primary/45 to-primary'
                      }
                    />
                  </div>
                </li>
              )
            })}
          </ul>

          <Reveal delay={0.15} className="mt-12 text-center">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">{PROBLEM.totalLabel}</p>
            <p className="mt-2 text-6xl font-semibold tracking-tight text-gradient sm:text-7xl">{PROBLEM.total}</p>
            <p className="mt-5 text-lg font-medium">{PROBLEM.closing}</p>
          </Reveal>
        </div>
      </div>
    </Section>
  )
}
