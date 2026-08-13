'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { ANNOUNCEMENT } from '@/lib/content/site'

const COOKIE = 'oh_offer_ends'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; samesite=lax`
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Offer countdown. The end timestamp is written to a cookie on first visit so
 * it keeps ticking down across page loads instead of resetting on every render.
 */
export function AnnouncementBar() {
  const [remaining, setRemaining] = React.useState<number | null>(null)

  React.useEffect(() => {
    const windowMs = ANNOUNCEMENT.windowHours * 3_600_000
    const stored = Number(readCookie(COOKIE))
    let endsAt = Number.isFinite(stored) && stored > Date.now() ? stored : 0

    if (!endsAt) {
      endsAt = Date.now() + windowMs
      writeCookie(COOKIE, String(endsAt), ANNOUNCEMENT.windowHours * 3600)
    }

    const tick = () => setRemaining(Math.max(0, endsAt - Date.now()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  const label = React.useMemo(() => {
    if (remaining === null) return null
    const total = Math.floor(remaining / 1000)
    return `${pad(Math.floor(total / 3600))}h ${pad(Math.floor((total % 3600) / 60))}m ${pad(total % 60)}s`
  }, [remaining])

  return (
    <div className="relative z-50 border-b border-primary/20 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15">
      <Link
        href={ANNOUNCEMENT.href}
        className="container flex h-10 items-center justify-center gap-2 text-center text-xs font-medium sm:text-sm"
      >
        <span aria-hidden>{ANNOUNCEMENT.emoji}</span>
        <span className="text-foreground">{ANNOUNCEMENT.text}</span>
        <span className="hidden text-primary/50 sm:inline" aria-hidden>
          |
        </span>
        <span
          className="min-w-[7.5rem] font-mono tabular-nums text-primary"
          aria-live="off"
          suppressHydrationWarning
        >
          {label ?? ' '}
        </span>
        <ArrowRight className="size-3.5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
    </div>
  )
}
