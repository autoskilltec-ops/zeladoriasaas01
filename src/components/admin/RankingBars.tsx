interface RankingBarsRow {
  key: string
  label: string
  value: number
  trailing: string
  position?: number
}

interface RankingBarsProps {
  rows: RankingBarsRow[]
  barColor: string
  emptyLabel?: string
}

export function RankingBars({ rows, barColor, emptyLabel = 'Sem dados no período.' }: RankingBarsProps) {
  if (rows.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
        {emptyLabel}
      </p>
    )
  }

  const max = Math.max(...rows.map((r) => r.value), 1)

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          {row.position !== undefined && (
            <span className="w-4 shrink-0 text-[12px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {row.position}
            </span>
          )}
          <span className="w-20 shrink-0 truncate text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            {row.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: '#f0f2f1' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${(row.value / max) * 100}%`, background: barColor }}
            />
          </div>
          <span
            className="shrink-0 text-right text-[12px] font-medium whitespace-nowrap"
            style={{ color: 'var(--text-primary)' }}
          >
            {row.trailing}
          </span>
        </div>
      ))}
    </div>
  )
}
