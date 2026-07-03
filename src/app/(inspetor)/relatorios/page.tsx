import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { getRelatoriosData } from '@/lib/api/relatorios'
import { GlassCard } from '@/components/shared/GlassCard'
import { LineChart } from '@/components/shared/LineChart'
import { BarChart } from '@/components/shared/BarChart'
import { DonutChart } from '@/components/shared/DonutChart'
import { corCriticidade } from '@/lib/utils/calculos'
import { formatCriticidade } from '@/lib/utils/formatters'

export const dynamic = 'force-dynamic'

export default async function RelatoriosInspetorPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const data = await getRelatoriosData(supabase, user)

  const donutData = (['critico', 'alto', 'medio', 'baixo'] as const).map((c) => ({
    label: formatCriticidade(c),
    value: data.ncs_por_criticidade[c],
    color: corCriticidade(c),
  }))

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Relatórios
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Suas métricas dos últimos 6 meses
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <GlassCard>
          <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            IQL médio por mês
          </p>
          <LineChart data={data.iql_por_mes.map((m) => ({ label: m.mes.slice(5), value: m.iql_medio }))} />
        </GlassCard>

        <GlassCard>
          <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Inspeções por mês
          </p>
          <BarChart data={data.total_por_mes.map((m) => ({ label: m.mes.slice(5), value: m.total }))} />
        </GlassCard>

        <GlassCard>
          <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            NCs por criticidade
          </p>
          <DonutChart data={donutData} />
        </GlassCard>

        <GlassCard>
          <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Locais mais inspecionados
          </p>
          <div className="flex flex-col gap-2">
            {data.ranking_locais.slice(0, 5).map((l, idx) => (
              <div key={l.nome} className="flex items-center justify-between text-[13px]">
                <span style={{ color: 'var(--text-secondary)' }}>
                  {idx + 1}. {l.nome}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {l.total} · {l.iql_medio.toFixed(0)}%
                </span>
              </div>
            ))}
            {data.ranking_locais.length === 0 && (
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                Sem dados no período.
              </p>
            )}
          </div>
        </GlassCard>
      </div>

      <GlassCard>
        <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Desempenho por critério
        </p>
        <div className="flex flex-col divide-y divide-[#dce3de]">
          {data.desempenho_por_criterio.map((c) => (
            <div key={c.criterio} className="flex items-center justify-between py-2 text-[13px]">
              <span style={{ color: 'var(--text-secondary)' }}>{c.criterio}</span>
              <span style={{ color: 'var(--text-primary)' }}>{c.nota_media.toFixed(1)} / 5</span>
            </div>
          ))}
          {data.desempenho_por_criterio.length === 0 && (
            <p className="text-[13px] py-2" style={{ color: 'var(--text-muted)' }}>
              Sem avaliações no período.
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
