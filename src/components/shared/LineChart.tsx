interface LineChartProps {
  data: { label: string; value: number }[]
  color?: string
  height?: number
  max?: number
}

export function LineChart({ data, color = 'var(--forest-600)', height = 120, max = 100 }: LineChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
        Sem dados no período.
      </p>
    )
  }

  const width = Math.max(200, data.length * 60)
  const padding = 10
  const usableHeight = height - padding * 2

  const points = data.map((d, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - padding * 2) + padding
    const y = padding + usableHeight - (Math.min(d.value, max) / max) * usableHeight
    return { x, y, value: d.value, label: d.label }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height + 20}>
        <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r={3} fill={color} />
            <text x={p.x} y={height + 14} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
