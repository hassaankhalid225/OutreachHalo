'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

interface TagInputProps {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  suggestions?: string[]
  className?: string
  id?: string
  max?: number
}

/** Comma/Enter-committed tag field. Backspace on an empty input pops the last tag. */
export function TagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter…',
  suggestions = [],
  className,
  id,
  max = 20,
}: TagInputProps) {
  const [draft, setDraft] = React.useState('')

  const commit = React.useCallback(
    (raw: string) => {
      const tag = raw.trim().replace(/,$/, '')
      if (!tag || value.length >= max) return
      if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) return
      onChange([...value, tag])
    },
    [value, onChange, max]
  )

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit(draft)
      setDraft('')
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  const unused = suggestions.filter((s) => !value.some((v) => v.toLowerCase() === s.toLowerCase())).slice(0, 6)

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-xl border border-input bg-secondary/40 px-2 py-1.5',
          'focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/30'
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-primary/15 py-1 pl-2.5 pr-1 text-xs font-medium text-primary"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((v) => v !== tag))}
              className="rounded p-0.5 transition-colors hover:bg-primary/25"
              aria-label={`Remove ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (draft.trim()) {
              commit(draft)
              setDraft('')
            }
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-sm outline-none placeholder:text-muted-foreground/70"
        />
      </div>

      {unused.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {unused.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => commit(s)}
              className="rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Chip-style multi-select for small, fixed option sets (industries, geos, intent). */
export function ChipSelect({
  options,
  value,
  onChange,
  className,
}: {
  options: readonly string[]
  value: string[]
  onChange: (next: string[]) => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((option) => {
        const active = value.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? value.filter((v) => v !== option) : [...value, option])}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              active
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-border text-muted-foreground hover:border-border/70 hover:text-foreground'
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
