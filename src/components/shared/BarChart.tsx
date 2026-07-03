interface BarChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
}

export function BarChart({ data, color = 'var(--forest-500)', height = 120 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))

  if (data.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
        Sem dados no período.
      </p>
    )
  }

  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            {d.value}
          </span>
          <div
            className="w-full rounded-t-md transition-all"
            style={{
              height: Math.max(4, (d.value / max) * (height - 36)),
              background: color,
            }}
          />
          <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  )
}
