import { cn } from '@/lib/utils'

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  className?: string
}

export function CircularProgress({
  value,
  size = 72,
  strokeWidth = 7,
  color = 'var(--forest-500)',
  label,
  className,
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--forest-100)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {label ?? `${Math.round(clamped)}%`}
        </span>
      </div>
    </div>
  )
}
