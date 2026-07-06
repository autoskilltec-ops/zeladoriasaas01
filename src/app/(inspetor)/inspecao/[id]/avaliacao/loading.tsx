import { Skeleton } from '@/components/shared/Skeleton'
import { FormSkeleton } from '@/components/shared/PageSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Skeleton className="mb-4 h-8 w-full rounded-lg" />
      <FormSkeleton fields={5} />
    </div>
  )
}
