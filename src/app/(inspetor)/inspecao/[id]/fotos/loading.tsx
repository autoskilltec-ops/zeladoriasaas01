import { Skeleton } from '@/components/shared/Skeleton'
import { GlassCard } from '@/components/shared/GlassCard'

export default function Loading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Skeleton className="mb-4 h-8 w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        <GlassCard className="h-40 w-full" />
        <GlassCard className="h-40 w-full" />
      </div>
    </div>
  )
}
