'use client'

import * as React from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

import { cn } from '@/lib/utils'

const variants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
}

/** Scroll-triggered fade-up. Fires once, respects reduced-motion via CSS. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const MotionTag = motion[as] as typeof motion.div
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}

/** Staggers direct children on enter — used for card grids and mockup rows. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </motion.div>
  )
}

/** Section wrapper: consistent vertical rhythm and an optional glow blob. */
export function Section({
  children,
  className,
  id,
  glow,
}: {
  children: React.ReactNode
  className?: string
  id?: string
  glow?: 'top' | 'center' | 'none'
}) {
  return (
    <section id={id} className={cn('relative py-20 md:py-28', className)}>
      {glow && glow !== 'none' && (
        <div
          aria-hidden
          className={cn(
            'glow-blob h-[28rem] w-[46rem] bg-primary/[0.13]',
            glow === 'top' ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/3' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'
          )}
        />
      )}
      {children}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'center',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  body?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <Reveal className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl', className)}>
      {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
      <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      {body && <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">{body}</p>}
    </Reveal>
  )
}
