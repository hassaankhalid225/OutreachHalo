'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Surfaced to the browser console in dev; wire to your error tracker here.
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="flex min-h-[70dvh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-destructive/12 text-destructive">
          <AlertTriangle className="size-5" />
        </span>

        <h1 className="mt-5 text-lg font-semibold">That page did not load</h1>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
          Something failed while fetching your workspace. Your data is fine — this is a read error, not a write.
        </p>

        {/* Next strips messages from production errors, but when one survives it
            is usually the fastest route to the cause — so show it. */}
        {error.message && (
          <p className="mt-4 rounded-xl border border-border bg-secondary/50 px-3.5 py-3 text-left text-xs leading-relaxed text-muted-foreground">
            {error.message}
          </p>
        )}

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted-foreground/70">Reference: {error.digest}</p>
        )}

        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={reset}>
            <RotateCw /> Try again
          </Button>
          <Button asChild variant="secondary">
            <Link href="/app/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
