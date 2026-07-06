import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md', className)}
      style={{ background: 'var(--forest-100)' }}
      {...props}
    />
  )
}
