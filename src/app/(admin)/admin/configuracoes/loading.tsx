import { ListSkeleton } from '@/components/shared/PageSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <ListSkeleton rows={4} />
    </div>
  )
}
