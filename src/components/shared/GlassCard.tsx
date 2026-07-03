import { cn } from '@/lib/utils'

interface GlassCardProps extends React.ComponentProps<'div'> {
  variant?: 'default' | 'sm' | 'accent'
}

export function GlassCard({ children, variant = 'default', className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'glass-card',
        variant === 'sm' && 'glass-card-sm',
        variant === 'accent' && 'glass-card-accent',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
