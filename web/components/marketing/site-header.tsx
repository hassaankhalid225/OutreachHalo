'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'

import { NAV } from '@/lib/content/site'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/logos'

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = React.useState(false)
  const [openGroup, setOpenGroup] = React.useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const closeTimer = React.useRef<number | null>(null)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Route change closes everything.
  React.useEffect(() => {
    setMobileOpen(false)
    setOpenGroup(null)
  }, [pathname])

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null)
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function open(label: string) {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    setOpenGroup(label)
  }

  function scheduleClose() {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpenGroup(null), 120)
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <nav className="container flex h-16 items-center justify-between gap-4" aria-label="Main">
        <Link href="/" className="shrink-0" aria-label="OutreachHalo home">
          <Logo />
        </Link>

        {/* Desktop nav ------------------------------------------------- */}
        <ul className="hidden items-center gap-0.5 lg:flex">
          {NAV.map((group) => {
            const isOpen = openGroup === group.label
            const active = pathname === group.href || (group.href !== '/' && pathname.startsWith(group.href))

            return (
              <li
                key={group.label}
                className="relative"
                onMouseEnter={() => group.items && open(group.label)}
                onMouseLeave={scheduleClose}
              >
                {group.items ? (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setOpenGroup(isOpen ? null : group.label)}
                    onFocus={() => open(group.label)}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                      active || isOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {group.label}
                    <ChevronDown className={cn('size-3.5 transition-transform', isOpen && 'rotate-180')} aria-hidden />
                  </button>
                ) : (
                  <Link
                    href={group.href}
                    className={cn(
                      'flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                      active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {group.label}
                  </Link>
                )}

                {group.items && isOpen && (
                  <div
                    className="absolute left-1/2 top-full z-50 w-max -translate-x-1/2 pt-3"
                    onMouseEnter={() => open(group.label)}
                    onMouseLeave={scheduleClose}
                  >
                    <div
                      className={cn(
                        'animate-fade-up rounded-2xl border border-border bg-popover p-2 shadow-halo',
                        group.featured ? 'grid grid-cols-[minmax(0,1fr)_15rem] gap-2' : ''
                      )}
                    >
                      <ul className={cn('grid gap-0.5', group.items.length > 5 ? 'grid-cols-2' : 'grid-cols-1', 'min-w-[19rem]')}>
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-secondary"
                            >
                              <span className="block text-sm font-medium text-foreground">{item.label}</span>
                              {item.description && (
                                <span className="mt-0.5 block text-xs text-muted-foreground">{item.description}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>

                      {group.featured && (
                        <Link
                          href={group.featured.href}
                          className="flex flex-col justify-between rounded-xl border border-primary/20 bg-primary/[0.07] p-4 transition-colors hover:bg-primary/[0.12]"
                        >
                          <div>
                            <p className="text-sm font-semibold">{group.featured.title}</p>
                            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{group.featured.body}</p>
                          </div>
                          <span className="mt-4 text-xs font-medium text-primary">{group.featured.cta} →</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {/* Actions ----------------------------------------------------- */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/sign-up">Start for free</Link>
          </Button>
          <button
            type="button"
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer -------------------------------------------------- */}
      {mobileOpen && (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-border bg-background/98 backdrop-blur-xl lg:hidden">
          <div className="container space-y-1 py-6">
            {NAV.map((group) => (
              <details key={group.label} className="group border-b border-border/60 last:border-0">
                <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-base font-medium marker:hidden">
                  {group.items ? (
                    <>
                      {group.label}
                      <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
                    </>
                  ) : (
                    <Link href={group.href} className="w-full">
                      {group.label}
                    </Link>
                  )}
                </summary>
                {group.items && (
                  <ul className="space-y-0.5 pb-3">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </details>
            ))}

            <div className="grid gap-2 pt-6">
              <Button asChild variant="secondary" size="lg">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/sign-up">Start for free</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
