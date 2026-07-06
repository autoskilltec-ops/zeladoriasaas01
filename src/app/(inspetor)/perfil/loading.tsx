import { FormSkeleton } from '@/components/shared/PageSkeletons'

export default function Loading() {
  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <FormSkeleton fields={3} />
    </div>
  )
}
