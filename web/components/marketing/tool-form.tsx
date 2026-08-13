'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, Copy, Info, RefreshCw, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import type { ToolDef } from '@/lib/content/pages'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/misc'

export function ToolForm({ tool }: { tool: ToolDef }) {
  const [values, setValues] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(tool.fields.map((f) => [f.name, f.type === 'select' ? (f.options?.[0] ?? '') : '']))
  )
  const [output, setOutput] = React.useState<string | null>(null)
  const [note, setNote] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const missing = tool.fields.filter((f) => f.required && !values[f.name]?.trim())

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.map((f) => f.label).join(', ')}`)
      return
    }

    setLoading(true)
    setOutput(null)
    setNote(null)

    try {
      const response = await fetch('/api/tools/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: tool.kind, input: values }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? 'Something went wrong.')
        return
      }

      setOutput(data.text)
      setNote(data.note)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    if (!output) return
    await navigator.clipboard.writeText(output)
    setCopied(true)
    toast.success('Copied to clipboard')
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      {/* Input --------------------------------------------------------- */}
      <form onSubmit={submit} className="rounded-2xl border border-border bg-card/60 p-6">
        <div className="space-y-5">
          {tool.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.label}
                {field.required && <span className="ml-1 text-primary">*</span>}
              </Label>

              {field.type === 'textarea' ? (
                <Textarea
                  id={field.name}
                  value={values[field.name]}
                  placeholder={field.placeholder}
                  rows={5}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={values[field.name]}
                  onValueChange={(value) => setValues((v) => ({ ...v, [field.name]: value }))}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  value={values[field.name]}
                  placeholder={field.placeholder}
                  onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <Button type="submit" size="lg" className="mt-6 w-full" loading={loading}>
          {!loading && <Sparkles />}
          {loading ? 'Writing…' : tool.cta}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Free, no signup. 12 generations per hour.
        </p>
      </form>

      {/* Output -------------------------------------------------------- */}
      <div className="flex flex-col rounded-2xl border border-border bg-card/40 p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Result</h2>
          {output && (
            <div className="flex gap-1.5">
              <Button variant="ghost" size="icon-sm" onClick={copy} aria-label="Copy result">
                {copied ? <Check className="text-positive" /> : <Copy />}
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={submit} aria-label="Regenerate" disabled={loading}>
                <RefreshCw />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 flex-1">
          {loading ? (
            <div className="space-y-2.5">
              {[100, 92, 96, 70, 88, 60].map((width, i) => (
                <Skeleton key={i} className="h-4" style={{ width: `${width}%` }} />
              ))}
            </div>
          ) : output ? (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">{output}</pre>
          ) : (
            <div className="flex h-full min-h-[14rem] flex-col items-center justify-center gap-3 text-center">
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                <Sparkles className="size-4 text-muted-foreground" />
              </span>
              <p className="max-w-xs text-sm text-muted-foreground">
                Fill in the fields and your result will appear here.
              </p>
            </div>
          )}
        </div>

        {note && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-warm/25 bg-warm/[0.06] px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0 text-warm" />
            {note}
          </p>
        )}

        {output && (
          <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            Want this written from each prospect’s real buying signals and sent automatically?{' '}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Start a free trial →
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
