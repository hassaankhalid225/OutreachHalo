import Link from 'next/link'
import { Linkedin } from 'lucide-react'

import { FOOTER_COLUMNS, LEGAL_DISCLAIMER, SITE } from '@/lib/content/site'
import { Logo } from '@/components/brand/logos'

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  )
}

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-24 border-t border-border bg-card/30">
      <div className="container py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          <div>
            <Link href="/" aria-label="OutreachHalo home">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{SITE.tagline}</p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href={SITE.social.x}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="OutreachHalo on X"
                className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <XIcon className="size-4" />
              </a>
              <a
                href={SITE.social.linkedin}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="OutreachHalo on LinkedIn"
                className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Linkedin className="size-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">{column.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.href}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-border pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-muted-foreground/80">{LEGAL_DISCLAIMER}</p>
          <div className="mt-6 flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {year} {SITE.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-foreground">
                Terms
              </Link>
              <Link href="/refund" className="transition-colors hover:text-foreground">
                Refunds
              </Link>
              <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-foreground">
                {SITE.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
