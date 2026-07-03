import { GlassCard } from '@/components/shared/GlassCard'
import { CircularProgress } from '@/components/shared/CircularProgress'

interface DashboardMetricProps {
  label: string
  value: string
  ringValue?: number
  ringColor?: string
  variacao?: number | null
  variacaoLabel?: string
}

export function DashboardMetric({
  label,
  value,
  ringValue,
  ringColor = 'var(--forest-500)',
  variacao,
  variacaoLabel = 'vs período anterior',
}: DashboardMetricProps) {
  return (
    <GlassCard className="flex items-center gap-3">
      {ringValue !== undefined && (
        <CircularProgress value={ringValue} size={52} strokeWidth={5} color={ringColor} />
      )}
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        <span className="text-[20px] font-medium" style={{ color: 'var(--text-primary)' }}>
          {value}
        </span>
        {variacao !== undefined && variacao !== null && (
          <span
            className="text-[11px]"
            style={{ color: variacao >= 0 ? 'var(--baixo)' : 'var(--critico)' }}
          >
            {variacao >= 0 ? '↑' : '↓'} {Math.abs(variacao).toFixed(1)}% {variacaoLabel}
          </span>
        )}
      </div>
    </GlassCard>
  )
}
