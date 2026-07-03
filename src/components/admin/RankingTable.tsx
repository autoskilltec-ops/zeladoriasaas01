import { GlassCard } from '@/components/shared/GlassCard'

export interface RankingColumn<T> {
  header: string
  render: (row: T, index: number) => React.ReactNode
  align?: 'left' | 'right'
}

interface RankingTableProps<T> {
  title: string
  columns: RankingColumn<T>[]
  rows: T[]
  emptyLabel?: string
  keyExtractor: (row: T, index: number) => string
}

export function RankingTable<T>({
  title,
  columns,
  rows,
  emptyLabel = 'Sem dados no período.',
  keyExtractor,
}: RankingTableProps<T>) {
  return (
    <GlassCard>
      <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {title}
      </p>
      {rows.length === 0 ? (
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          {emptyLabel}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b" style={{ borderColor: '#dce3de' }}>
                {columns.map((col) => (
                  <th
                    key={col.header}
                    className="py-1.5 pr-3 text-[11px] font-medium uppercase tracking-wide whitespace-nowrap"
                    style={{
                      color: 'var(--text-muted)',
                      textAlign: col.align ?? 'left',
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={keyExtractor(row, index)} className="border-b last:border-0" style={{ borderColor: '#eef1ee' }}>
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className="py-2 pr-3 whitespace-nowrap"
                      style={{ color: 'var(--text-primary)', textAlign: col.align ?? 'left' }}
                    >
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  )
}
