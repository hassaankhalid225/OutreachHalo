'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

import { HOW_IT_WORKS } from '@/lib/content/site'
import { cn } from '@/lib/utils'
import { Section, SectionHeading } from '@/components/marketing/reveal'
import { MOCKUPS, type MockupName } from '@/components/mockups'

const ADVANCE_MS = 7000
const TICK_MS = 50

export function HowItWorksSection() {
  const steps = HOW_IT_WORKS.steps
  const [active, setActive] = React.useState(0)
  const [progress, setProgress] = React.useState(0)
  const [paused, setPaused] = React.useState(false)

  // Auto-advance with a visible progress bar. Any manual click stops it for good.
  React.useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_MS / ADVANCE_MS) * 100
        if (next >= 100) {
          setActive((current) => (current + 1) % steps.length)
          return 0
        }
        return next
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [paused, steps.length])

  function select(index: number) {
    setPaused(true)
    setActive(index)
    setProgress(0)
  }

  const Mockup = MOCKUPS[steps[active].mockup as MockupName]

  return (
    <Section id="how-it-works" className="border-y border-border bg-card/20">
      <div className="container">
        <SectionHeading eyebrow={HOW_IT_WORKS.eyebrow} title={HOW_IT_WORKS.headline} body={HOW_IT_WORKS.body} />

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          {/* Steps -------------------------------------------------- */}
          <ol className="space-y-3">
            {steps.map((step, i) => {
              const isActive = i === active
              return (
                <li key={step.key}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-current={isActive ? 'step' : undefined}
                    className={cn(
                      'relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300',
                      isActive
                        ? 'border-primary/30 bg-card shadow-halo'
                        : 'border-border bg-card/40 hover:border-border/70 hover:bg-card/70'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-[11px] font-medium uppercase tracking-[0.14em] transition-colors',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {step.kicker}
                        </p>
                        <p className="mt-1 text-base font-semibold">{step.title}</p>
                        <p
                          className={cn(
                            'mt-1.5 text-sm leading-relaxed transition-colors',
                            isActive ? 'text-muted-foreground' : 'text-muted-foreground/70'
                          )}
                        >
                          {step.body}
                        </p>
                      </div>
                    </div>

                    {isActive && !paused && (
                      <span
                        aria-hidden
                        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
                        style={{ transform: `scaleX(${progress / 100})`, transition: 'transform 50ms linear' }}
                      />
                    )}
                  </button>
                </li>
              )
            })}
          </ol>

          {/* Visual panel ------------------------------------------- */}
          <div className="relative lg:sticky lg:top-24 lg:self-start">
            <div aria-hidden className="glow-blob left-1/2 top-1/2 h-72 w-80 -translate-x-1/2 -translate-y-1/2 bg-primary/12" />
            <AnimatePresence mode="wait">
              <motion.div
                key={steps[active].key}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <Mockup />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Section>
  )
}
