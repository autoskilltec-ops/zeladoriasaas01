import { GlassCard } from '@/components/shared/GlassCard'
import { CritBadge } from '@/components/shared/CritBadge'
import { formatPercent } from '@/lib/utils/formatters'
import { classificarIndice } from '@/lib/utils/calculos'
import type { CriticidadeNivel } from '@/types/database'

interface ResumoCardProps {
  local: string
  dataHora: string
  inspetor: string
  zelador: string
  iql: number
  cs: number
  totalNc: number
  criticidadeMaisAlta: CriticidadeNivel | null
}

export function ResumoCard({
  local,
  dataHora,
  inspetor,
  zelador,
  iql,
  cs,
  totalNc,
  criticidadeMaisAlta,
}: ResumoCardProps) {
  const iqlClass = classificarIndice(iql)
  const csClass = classificarIndice(cs)

  return (
    <GlassCard className="flex flex-col gap-4">
      <div>
        <p
          className="mb-2 text-[11px] font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          Resumo da inspeção
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[13px]">
          <dt style={{ color: 'var(--text-secondary)' }}>Local:</dt>
          <dd style={{ color: 'var(--text-primary)' }}>{local}</dd>
          <dt style={{ color: 'var(--text-secondary)' }}>Data:</dt>
          <dd style={{ color: 'var(--text-primary)' }}>{dataHora}</dd>
          <dt style={{ color: 'var(--text-secondary)' }}>Inspetor:</dt>
          <dd style={{ color: 'var(--text-primary)' }}>{inspetor}</dd>
          <dt style={{ color: 'var(--text-secondary)' }}>Zelador:</dt>
          <dd style={{ color: 'var(--text-primary)' }}>{zelador}</dd>
        </dl>
      </div>

      <div className="border-t pt-4" style={{ borderColor: '#dce3de' }}>
        <p
          className="mb-2 text-[11px] font-medium uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          Índices
        </p>
        <div className="flex flex-col gap-2 text-[13px]">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Qualidade da Limpeza</span>
            <span className="font-medium" style={{ color: iqlClass.color }}>
              {formatPercent(iql)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Conformidade Segurança</span>
            <span className="font-medium" style={{ color: csClass.color }}>
              {formatPercent(cs)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Não conformidades</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {totalNc}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-secondary)' }}>Criticidade mais alta</span>
            {criticidadeMaisAlta ? (
              <CritBadge criticidade={criticidadeMaisAlta} />
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>—</span>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
