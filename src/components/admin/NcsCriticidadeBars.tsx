import { CheckCircle2 } from 'lucide-react'

interface NcsCriticidadeBarsProps {
  data: { critico: number; alto: number; medio: number; baixo: number }
}

const NIVEIS = [
  { key: 'critico', label: 'Crítico', color: '#ef4444' },
  { key: 'alto', label: 'Alto', color: '#f97316' },
  { key: 'medio', label: 'Médio', color: '#f59e0b' },
  { key: 'baixo', label: 'Baixo', color: '#3dbf65' },
] as const

export function NcsCriticidadeBars({ data }: NcsCriticidadeBarsProps) {
  const total = data.critico + data.alto + data.medio + data.baixo

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <CheckCircle2 size={28} color="#3dbf65" />
        <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
          Nenhuma não conformidade aberta
        </p>
      </div>
    )
  }

  const max = Math.max(data.critico, data.alto, data.medio, data.baixo, 1)

  return (
    <div className="flex flex-col gap-3">
      {NIVEIS.map((nivel) => {
        const valor = data[nivel.key]
        return (
          <div key={nivel.key} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: nivel.color }} />
            <span className="w-14 shrink-0 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {nivel.label}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: '#f0f2f1' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(valor / max) * 100}%`, background: nivel.color }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
              {valor}
            </span>
          </div>
        )
      })}
    </div>
  )
}
