import { Skeleton } from '@/components/shared/Skeleton'

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dashboard-card flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[3fr_2fr]">
        <div className="dashboard-card">
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="dashboard-card">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="dashboard-card">
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
      <div className="dashboard-card">
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  )
}
