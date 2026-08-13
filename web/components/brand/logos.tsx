import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Simplified, original glyphs for the platforms and AI agents we integrate with.
 * These are deliberately schematic rather than exact trademark reproductions —
 * they identify the service without copying anyone's logo artwork.
 */

type GlyphProps = { className?: string }

/** Hairline for glyphs with a white field, so their edge survives on a white card. */
const TILE_EDGE = '#E2E0EC'

export function LinkedInGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        fill="#fff"
        d="M7.1 9.6h2.2v7.5H7.1V9.6Zm1.1-3.5a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6ZM11 9.6h2.1v1h.03c.3-.55 1.02-1.13 2.1-1.13 2.24 0 2.65 1.42 2.65 3.27v4.36h-2.2v-3.87c0-.92-.02-2.11-1.3-2.11-1.3 0-1.5 1-1.5 2.04v3.94H11V9.6Z"
      />
    </svg>
  )
}

export function GmailGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect x="0.5" y="0.5" width="23" height="23" rx="4.5" fill="#fff" stroke={TILE_EDGE} />
      <path d="M4 7.5 12 13l8-5.5V17a1 1 0 0 1-1 1h-2.5v-6L12 15.4 7.5 12v6H5a1 1 0 0 1-1-1V7.5Z" fill="#EA4335" />
      <path d="M4 7.5V7a1 1 0 0 1 1.6-.8L12 10.7l6.4-4.5A1 1 0 0 1 20 7v.5L12 13 4 7.5Z" fill="#C5221F" />
    </svg>
  )
}

export function OutlookGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#0F6CBD" />
      <rect x="12.5" y="7" width="8" height="10" rx="1" fill="#fff" opacity="0.55" />
      <ellipse cx="8.4" cy="12" rx="4.6" ry="5.2" fill="#fff" />
      <ellipse cx="8.4" cy="12" rx="2.2" ry="2.9" fill="#0F6CBD" />
    </svg>
  )
}

export function GoogleWorkspaceGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect x="0.5" y="0.5" width="23" height="23" rx="4.5" fill="#fff" stroke={TILE_EDGE} />
      <circle cx="8.5" cy="8.5" r="3" fill="#4285F4" />
      <circle cx="15.5" cy="8.5" r="3" fill="#EA4335" />
      <circle cx="8.5" cy="15.5" r="3" fill="#34A853" />
      <circle cx="15.5" cy="15.5" r="3" fill="#FBBC05" />
    </svg>
  )
}

export function ClaudeGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#D97757" />
      <path
        fill="#fff"
        d="M12 5.2 13.5 10l4.8 1.5-4.8 1.5L12 18.8 10.5 13 5.7 11.5 10.5 10 12 5.2Z"
      />
    </svg>
  )
}

export function OpenAIGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#0D0D0D" />
      <path
        d="M12 5.5 17.2 8.5v6L12 17.5 6.8 14.5v-6L12 5.5Z"
        fill="none"
        stroke="#10A37F"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.5" r="2" fill="#10A37F" />
    </svg>
  )
}

export function GeminiGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect x="0.5" y="0.5" width="23" height="23" rx="4.5" fill="#fff" stroke={TILE_EDGE} />
      <path
        d="M12 4c.4 4.2 3.4 7.2 7.6 7.6-4.2.4-7.2 3.4-7.6 7.6-.4-4.2-3.4-7.2-7.6-7.6C8.6 11.2 11.6 8.2 12 4Z"
        fill="#4285F4"
      />
    </svg>
  )
}

export function PerplexityGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#20808D" />
      <path
        d="M12 5.5v13M12 8.5 7.5 5.5v6H12M12 8.5l4.5-3v6H12M12 15.5l-4.5 3v-6H12M12 15.5l4.5 3v-6H12"
        fill="none"
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CursorGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#111114" />
      <path d="M12 4.2 19 8.3v7.4L12 19.8 5 15.7V8.3L12 4.2Z" fill="none" stroke="#fff" strokeWidth="1.3" />
      <path d="M12 4.2v7.6l7 3.9M12 11.8 5 15.7M12 11.8l7-3.5" stroke="#fff" strokeWidth="1.1" opacity="0.7" />
    </svg>
  )
}

export function GenericAgentGlyph({ className, label }: GlyphProps & { label: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-full', className)} aria-hidden>
      <rect width="24" height="24" rx="5" fill="#1A1A22" stroke="#2B2B36" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#A9A9BC"
        fontFamily="system-ui, sans-serif"
      >
        {label}
      </text>
    </svg>
  )
}

export const PROVIDER_GLYPHS = {
  linkedin: LinkedInGlyph,
  gmail: GmailGlyph,
  outlook: OutlookGlyph,
  google_workspace: GoogleWorkspaceGlyph,
} as const

export type ProviderKey = keyof typeof PROVIDER_GLYPHS

export const PROVIDER_LABELS: Record<ProviderKey, string> = {
  linkedin: 'LinkedIn',
  gmail: 'Gmail',
  outlook: 'Outlook',
  google_workspace: 'Google Workspace',
}

export const AI_AGENTS = [
  { name: 'Claude', Glyph: ClaudeGlyph },
  { name: 'ChatGPT', Glyph: OpenAIGlyph },
  { name: 'Gemini', Glyph: GeminiGlyph },
  { name: 'Perplexity', Glyph: PerplexityGlyph },
  { name: 'Cursor', Glyph: CursorGlyph },
  { name: 'OpenClaw', Glyph: (p: GlyphProps) => <GenericAgentGlyph {...p} label="OC" /> },
  { name: 'Hermes', Glyph: (p: GlyphProps) => <GenericAgentGlyph {...p} label="H" /> },
] as const

/** The product wordmark — a halo ring with an orbiting node. */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex size-8 shrink-0 items-center justify-center">
        <svg viewBox="0 0 32 32" className="size-full" aria-hidden>
          <defs>
            <linearGradient id="halo-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="hsl(252 100% 74%)" />
              <stop offset="100%" stopColor="hsl(268 90% 52%)" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="11" fill="none" stroke="url(#halo-ring)" strokeWidth="3" />
          <circle cx="16" cy="16" r="4" fill="url(#halo-ring)" />
          <circle cx="25.5" cy="8.5" r="3.2" fill="hsl(252 100% 74%)" />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[17px] font-semibold tracking-tight text-foreground">
          Outreach<span className="text-primary">Halo</span>
        </span>
      )}
    </span>
  )
}
