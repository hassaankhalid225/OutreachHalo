import { Skeleton } from '@/components/ui/misc'

/** Covers every `/app/*` segment so navigation never flashes a blank pane. */
export default function AppLoading() {
  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-border px-5 py-6 sm:flex-row sm:items-start sm:justify-between md:px-8">
        <div className="space-y-2.5">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 md:px-8 md:py-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[7.5rem] rounded-2xl" />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>

        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  )
}
