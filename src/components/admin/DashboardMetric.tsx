import { CircularProgress } from '@/components/shared/CircularProgress'

interface DashboardMetricProps {
  icon: React.ReactNode
  label: string
  value: string
  ringValue: number
  ringColor?: string
  subLabel: string
  meta: string
}

export function DashboardMetric({
  icon,
  label,
  value,
  ringValue,
  ringColor = '#3dbf65',
  subLabel,
  meta,
}: DashboardMetricProps) {
  return (
    <div className="dashboard-card flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <CircularProgress value={ringValue} size={48} strokeWidth={5} color={ringColor} />
        <div className="flex flex-col">
          <span className="text-[22px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {value}
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {subLabel}
          </span>
        </div>
      </div>
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {meta}
      </p>
    </div>
  )
}
