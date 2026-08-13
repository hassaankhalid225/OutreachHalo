import { PlugZap } from 'lucide-react'

/**
 * Shown when the FastAPI backend cannot be contacted.
 *
 * Deliberately does NOT fall back to the demo store: silently swapping in
 * fixture data would look like the user's real pipeline had emptied itself.
 */
export function BackendOfflineBanner({ message }: { message: string }) {
  return (
    <div className="border-b border-warm/30 bg-warm/[0.08] px-5 py-3.5 md:px-8">
      <div className="flex items-start gap-3">
        <PlugZap className="mt-0.5 size-4 shrink-0 text-warm" />
        <div className="min-w-0">
          <p className="text-sm font-medium">Backend not reachable</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}
