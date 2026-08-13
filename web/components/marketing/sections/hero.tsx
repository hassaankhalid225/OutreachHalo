'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

import { HERO, TRUST_STRIP } from '@/lib/content/site'
import { Button } from '@/components/ui/button'
import { PersonAvatar } from '@/components/ui/avatar'
import { BrowserFrame } from '@/components/mockups'
import { PROVIDER_GLYPHS, PROVIDER_LABELS, type ProviderKey } from '@/components/brand/logos'
import { HeroAppPreview } from './hero-app-preview'

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-14 md:pb-24 md:pt-20">
      {/* Ambient background ------------------------------------------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[42rem] grid-lines opacity-70" />
        <div className="glow-blob left-1/2 top-[-6rem] h-[30rem] w-[52rem] -translate-x-1/2 bg-primary/[0.14]" />
        <div className="glow-blob right-[-10rem] top-[18rem] h-[24rem] w-[24rem] bg-[#22D3EE]/[0.09]" />
      </div>

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p custom={0} initial="hidden" animate="show" variants={fade} className="eyebrow">
            <Sparkles className="size-3" aria-hidden />
            {HERO.eyebrow}
          </motion.p>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="show"
            variants={fade}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-display-md lg:text-display-lg"
          >
            <span className="text-gradient">{HERO.headline}</span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="show"
            variants={fade}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {HERO.sub}
          </motion.p>

          <motion.div
            custom={3}
            initial="hidden"
            animate="show"
            variants={fade}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="xl" className="w-full sm:w-auto">
              <Link href="/sign-up">
                {HERO.cta}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
              <Link href="#how-it-works">{HERO.secondaryCta}</Link>
            </Button>
          </motion.div>

          <motion.div
            custom={4}
            initial="hidden"
            animate="show"
            variants={fade}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <div className="flex -space-x-2.5">
              {HERO.proofNames.map((name) => (
                <PersonAvatar key={name} name={name} className="size-8 border-2 border-background" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{HERO.socialProof}</p>
          </motion.div>
        </div>

        {/* Product frame ------------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <div aria-hidden className="glow-blob left-1/2 top-10 h-[22rem] w-[40rem] -translate-x-1/2 bg-primary/[0.18]" />
          <BrowserFrame>
            <HeroAppPreview />
          </BrowserFrame>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-px h-32 bg-gradient-to-t from-background to-transparent"
          />
        </motion.div>

        {/* Trust strip -------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-14 flex flex-col items-center gap-5"
        >
          <p className="text-center text-sm text-muted-foreground">{TRUST_STRIP}</p>
          <ul className="flex flex-wrap items-center justify-center gap-2.5">
            {(Object.keys(PROVIDER_GLYPHS) as ProviderKey[]).map((key) => {
              const Glyph = PROVIDER_GLYPHS[key]
              return (
                <li
                  key={key}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 py-1.5 pl-1.5 pr-3.5 transition-colors hover:border-border/60"
                >
                  <span className="size-6 overflow-hidden rounded-md">
                    <Glyph />
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">{PROVIDER_LABELS[key]}</span>
                </li>
              )
            })}
          </ul>
        </motion.div>
      </div>
    </section>
  )
}
