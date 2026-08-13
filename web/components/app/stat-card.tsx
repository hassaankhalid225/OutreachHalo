import { cn } from '@/lib/utils'

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = 'default',
}: {
  label: string
  value: string | number
  hint?: string
  icon?: React.ReactNode
  tone?: 'default' | 'positive' | 'primary'
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-border/70">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon && (
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-xl',
              tone === 'positive' ? 'bg-positive/12 text-positive' : tone === 'primary' ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
