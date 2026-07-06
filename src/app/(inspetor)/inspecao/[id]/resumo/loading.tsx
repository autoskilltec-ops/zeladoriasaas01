import { Skeleton } from '@/components/shared/Skeleton'
import { ListSkeleton } from '@/components/shared/PageSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Skeleton className="mb-4 h-8 w-full rounded-lg" />
      <ListSkeleton rows={4} />
    </div>
  )
}
