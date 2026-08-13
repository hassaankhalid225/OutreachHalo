import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logos'

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div aria-hidden className="glow-blob left-1/2 top-1/3 h-72 w-[32rem] -translate-x-1/2 bg-primary/15" />

      <Link href="/" aria-label="OutreachHalo home">
        <Logo />
      </Link>

      <p className="mt-12 font-mono text-sm text-primary">404</p>
      <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
        This page is not in the pipeline.
      </h1>
      <p className="mt-4 max-w-md text-pretty text-muted-foreground">
        The link is broken or the page moved. The prospects are still out there though.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/">
            <ArrowLeft />
            Back home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/features">Browse features</Link>
        </Button>
      </div>
    </div>
  )
}
