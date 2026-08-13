'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logos'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div aria-hidden className="glow-blob left-1/2 top-1/3 h-72 w-[32rem] -translate-x-1/2 bg-destructive/10" />

      <Link href="/" aria-label="OutreachHalo home">
        <Logo />
      </Link>

      <span className="mt-12 flex size-11 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
        <AlertTriangle className="size-5" />
      </span>

      <h1 className="mt-5 text-balance text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-3 max-w-md text-pretty text-muted-foreground">
        An unexpected error stopped this page rendering. Trying again usually clears it.
      </p>

      {error.digest && <p className="mt-3 font-mono text-xs text-muted-foreground/70">Reference: {error.digest}</p>}

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button onClick={reset}>
          <RotateCw /> Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  )
}
