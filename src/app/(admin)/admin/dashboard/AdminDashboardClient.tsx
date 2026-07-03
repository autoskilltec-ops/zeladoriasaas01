'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/shared/GlassCard'
import { DonutChart } from '@/components/shared/DonutChart'
import { BarChart } from '@/components/shared/BarChart'
import { ChartLine } from '@/components/admin/ChartLine'
import { DashboardMetric } from '@/components/admin/DashboardMetric'
import { RankingTable } from '@/components/admin/RankingTable'
import { classificarIndice, corCriticidade } from '@/lib/utils/calculos'
import { formatCriticidade, formatDate, formatPercent, formatStatus } from '@/lib/utils/formatters'
import type { DashboardData, Periodo } from '@/lib/api/dashboard'

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Mês atual' },
  { value: 'mes_anterior', label: 'Mês anterior' },
  { value: 'personalizado', label: 'Personalizado' },
]

interface AdminDashboardClientProps {
  initialData: DashboardData
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [data, setData] = useState<DashboardData>(initialData)
  const [loading, setLoading] = useState(false)

  async function refetch(novoPeriodo: Periodo, novoInicio = inicio, novoFim = fim) {
    if (novoPeriodo === 'personalizado' && (!novoInicio || !novoFim)) return

    setLoading(true)
    try {
      const params = new URLSearchParams({ periodo: novoPeriodo })
      if (novoPeriodo === 'personalizado') {
        params.set('inicio', novoInicio)
        params.set('fim', novoFim)
      }
      const res = await fetch(`/api/dashboard?${params.toString()}`)
      const json = await res.json()
      if (res.ok) setData(json.data)
    } finally {
      setLoading(false)
    }
  }

  const iqlClass = classificarIndice(data.iql_medio)
  const csClass = classificarIndice(data.conformidade_epis)

  const donutData = (['critico', 'alto', 'medio', 'baixo'] as const).map((c) => ({
    label: formatCriticidade(c),
    value: data.ncs_por_criticidade[c],
    color: corCriticidade(c),
  }))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Visão geral da organização
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={periodo}
            onValueChange={(v) => {
              const novo = (v ?? 'mes') as Periodo
              setPeriodo(novo)
              if (novo !== 'personalizado') refetch(novo)
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODOS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {periodo === 'personalizado' && (
            <>
              <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="w-36" />
              <Input
                type="date"
                value={fim}
                onChange={(e) => {
                  setFim(e.target.value)
                  refetch('personalizado', inicio, e.target.value)
                }}
                className="w-36"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardMetric
          label="IQL Médio"
          value={formatPercent(data.iql_medio)}
          ringValue={data.iql_medio}
          ringColor={iqlClass.color}
          variacao={data.iql_variacao}
        />
        <DashboardMetric
          label="Conformidade EPIs"
          value={formatPercent(data.conformidade_epis)}
          ringValue={data.conformidade_epis}
          ringColor={csClass.color}
        />
        <GlassCard className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            NCs Abertas
          </span>
          <span className="text-[20px] font-medium" style={{ color: 'var(--critico)' }}>
            {data.ncs_abertas}
          </span>
          <div className="flex gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            <span>C {data.ncs_por_criticidade.critico}</span>
            <span>A {data.ncs_por_criticidade.alto}</span>
            <span>M {data.ncs_por_criticidade.medio}</span>
            <span>B {data.ncs_por_criticidade.baixo}</span>
          </div>
        </GlassCard>
        <GlassCard className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Total de Inspeções
          </span>
          <span className="text-[20px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {data.total_inspecoes}
          </span>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ChartLine
          title="Evolução do IQL"
          data={data.inspecoes_por_dia.map((d) => ({ label: d.data.slice(5), value: d.total }))}
        />

        <GlassCard>
          <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            NCs por criticidade
          </p>
          <DonutChart data={donutData} />
        </GlassCard>

        <GlassCard>
          <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Inspeções por inspetor
          </p>
          <BarChart
            data={data.ranking_inspetores.map((i) => ({ label: i.nome.split(' ')[0], value: i.total }))}
          />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <RankingTable
          title="Ranking de locais"
          rows={data.ranking_locais}
          keyExtractor={(r) => r.nome}
          columns={[
            { header: '#', render: (_r, i) => i + 1 },
            { header: 'Local', render: (r) => r.nome },
            { header: 'IQL', render: (r) => formatPercent(r.iql_medio), align: 'right' },
            { header: 'Total', render: (r) => r.total, align: 'right' },
          ]}
        />

        <RankingTable
          title="Ranking de zeladores"
          rows={data.ranking_zeladores}
          keyExtractor={(r) => r.nome}
          columns={[
            { header: '#', render: (_r, i) => i + 1 },
            { header: 'Zelador', render: (r) => r.nome },
            { header: 'IQL', render: (r) => formatPercent(r.iql_medio), align: 'right' },
            { header: 'Avaliações', render: (r) => r.total, align: 'right' },
          ]}
        />
      </div>

      <GlassCard>
        <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Últimas inspeções
        </p>
        <div className="flex flex-col divide-y divide-[#dce3de]">
          {data.ultimas_inspecoes.map((i) => (
            <Link
              key={i.id}
              href={`/inspecao/${i.id}/resumo`}
              className="flex items-center justify-between py-2 text-[13px] hover:opacity-70"
            >
              <div>
                <p style={{ color: 'var(--text-primary)' }}>{i.local}</p>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(i.data)} · {i.inspetor} · {i.zelador} · {formatStatus(i.status)}
                </p>
              </div>
              <span style={{ color: 'var(--text-primary)' }}>{formatPercent(i.iql)}</span>
            </Link>
          ))}
          {data.ultimas_inspecoes.length === 0 && (
            <p className="py-2 text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Nenhuma inspeção no período.
            </p>
          )}
        </div>
      </GlassCard>

      {loading && (
        <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          Atualizando...
        </p>
      )}
    </div>
  )
}
