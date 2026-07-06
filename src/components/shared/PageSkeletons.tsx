import { GlassCard } from '@/components/shared/GlassCard'
import { Skeleton } from '@/components/shared/Skeleton'

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-7 w-40" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <GlassCard key={i} variant="sm" className="flex flex-col gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-12" />
          </GlassCard>
        ))}
      </div>
      <GlassCard className="h-56 w-full" />
      <GlassCard className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </GlassCard>
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <GlassCard key={i} variant="sm" className="flex items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-7 w-40" />
      <GlassCard className="flex flex-col gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        <Skeleton className="h-10 w-full rounded-lg" />
      </GlassCard>
    </div>
  )
}
