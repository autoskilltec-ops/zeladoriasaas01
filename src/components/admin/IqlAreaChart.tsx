interface IqlAreaChartProps {
  data: { mes: string; iql_medio: number }[]
}

const HEIGHT = 160
const PADDING_X = 12
const PADDING_TOP = 12
const PADDING_BOTTOM = 24
const MAX = 100

export function IqlAreaChart({ data }: IqlAreaChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
        Sem dados no período.
      </p>
    )
  }

  const width = Math.max(280, data.length * 70)
  const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM
  const usableWidth = width - PADDING_X * 2

  const points = data.map((d, i) => {
    const x = data.length === 1 ? width / 2 : (i / (data.length - 1)) * usableWidth + PADDING_X
    const y = PADDING_TOP + usableHeight - (Math.min(d.iql_medio, MAX) / MAX) * usableHeight
    return { x, y, mes: d.mes, valor: d.iql_medio }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const baseline = PADDING_TOP + usableHeight
  const areaPath = `${linePath} L${points[points.length - 1].x},${baseline} L${points[0].x},${baseline} Z`
  const gridLines = [0, 25, 50, 75, 100].map((pct) => PADDING_TOP + usableHeight - (pct / 100) * usableHeight)

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={HEIGHT}>
        {gridLines.map((y, i) => (
          <line key={i} x1={PADDING_X} y1={y} x2={width - PADDING_X} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
        ))}
        <path d={areaPath} fill="rgba(61,191,101,0.10)" stroke="none" />
        <path
          d={linePath}
          fill="none"
          stroke="#3dbf65"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p) => (
          <g key={p.mes}>
            <circle cx={p.x} cy={p.y} r={3.5} fill="#3dbf65" />
            <text x={p.x} y={HEIGHT - 6} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
              {p.mes}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
