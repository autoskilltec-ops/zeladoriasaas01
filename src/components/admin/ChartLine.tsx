import { GlassCard } from '@/components/shared/GlassCard'
import { LineChart } from '@/components/shared/LineChart'

interface ChartLineProps {
  title: string
  data: { label: string; value: number }[]
}

export function ChartLine({ title, data }: ChartLineProps) {
  return (
    <GlassCard>
      <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {title}
      </p>
      <LineChart data={data} />
    </GlassCard>
  )
}
