interface DonutSegment {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DonutSegment[]
  size?: number
  strokeWidth?: number
}

export function DonutChart({ data, size = 120, strokeWidth = 16 }: DonutChartProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  if (total === 0) {
    return (
      <div className="flex items-center gap-4">
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--forest-100)"
            strokeWidth={strokeWidth}
          />
        </svg>
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Sem registros
        </p>
      </div>
    )
  }

  const segments = data.reduce<{ label: string; color: string; dash: number; offset: number }[]>(
    (acc, segment) => {
      const previous = acc[acc.length - 1]
      const offset = previous ? previous.offset + previous.dash : 0
      const dash = (segment.value / total) * circumference
      acc.push({ label: segment.label, color: segment.color, dash, offset })
      return acc
    },
    []
  )

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((segment) => {
          if (segment.dash === 0) return null
          const gap = circumference - segment.dash
          return (
            <circle
              key={segment.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segment.dash} ${gap}`}
              strokeDashoffset={-segment.offset}
            />
          )
        })}
      </svg>
      <div className="flex flex-col gap-1">
        {data.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-[12px]">
            <span className="size-2.5 rounded-full" style={{ background: segment.color }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              {segment.label}: {segment.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
