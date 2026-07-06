'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Star,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
  BarChart3,
  Users,
  MapPin,
  UserCheck,
  History,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/shared/Skeleton'
import { DashboardMetric } from '@/components/admin/DashboardMetric'
import { IqlAreaChart } from '@/components/admin/IqlAreaChart'
import { NcsCriticidadeBars } from '@/components/admin/NcsCriticidadeBars'
import { RankingBars } from '@/components/admin/RankingBars'
import { formatDate, formatPercent, formatStatus } from '@/lib/utils/formatters'
import type { DashboardData, Periodo } from '@/lib/api/dashboard'

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'semana', label: 'Esta semana' },
  { value: 'mes', label: 'Mês atual' },
  { value: 'mes_anterior', label: 'Mês anterior' },
  { value: 'ultimos_3_meses', label: 'Últimos 3 meses' },
]

const NC_BADGES = [
  { key: 'critico', label: 'Crítico', bg: '#fef2f2', color: '#b91c1c' },
  { key: 'alto', label: 'Alto', bg: '#fff7ed', color: '#c2410c' },
  { key: 'medio', label: 'Médio', bg: '#fefce8', color: '#92400e' },
  { key: 'baixo', label: 'Baixo', bg: '#edfaf2', color: '#166534' },
] as const

function statusDotColor(status: string): string {
  if (status === 'finalizada') return '#3dbf65'
  if (status === 'em_andamento') return '#f59e0b'
  return '#d1d5db'
}

interface AdminDashboardClientProps {
  initialData: DashboardData
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [periodo, setPeriodo] = useState<Periodo>('mes')
  const [data, setData] = useState<DashboardData>(initialData)
  const [loading, setLoading] = useState(false)

  async function refetch(novoPeriodo: Periodo) {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard?periodo=${novoPeriodo}`)
      const json = await res.json()
      if (res.ok) setData(json.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4" style={{ background: 'var(--bg-app)' }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Visão geral da organização
          </p>
        </div>

        <Select
          value={periodo}
          onValueChange={(v) => {
            const novo = (v ?? 'mes') as Periodo
            setPeriodo(novo)
            refetch(novo)
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
      </div>

      {loading ? (
        <DashboardGridSkeleton />
      ) : (
        <>
          {/* Linha 1 — métricas */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <DashboardMetric
              icon={<Star size={14} color="#237a3c" />}
              label="IQL Médio"
              value={formatPercent(data.iql_medio)}
              ringValue={data.iql_medio}
              subLabel="Qualidade"
              meta="Meta: ≥ 90%"
            />
            <DashboardMetric
              icon={<ShieldCheck size={14} color="#237a3c" />}
              label="Conformidade EPIs"
              value={formatPercent(data.conformidade_epis)}
              ringValue={data.conformidade_epis}
              subLabel="Conformidade"
              meta="Meta: 100%"
            />

            <div className="dashboard-card flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <AlertTriangle size={14} color="#f59e0b" />
                <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  NCs Abertas
                </span>
              </div>
              <p
                className="text-center text-[24px] font-medium"
                style={{ color: data.ncs_abertas > 0 ? '#f97316' : '#3dbf65' }}
              >
                {data.ncs_abertas}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {NC_BADGES.map((b) => (
                  <span
                    key={b.key}
                    className="rounded-md px-1.5 py-0.5 text-center text-[11px] font-medium whitespace-nowrap"
                    style={{ background: b.bg, color: b.color }}
                  >
                    {b.label} {data.ncs_por_criticidade[b.key]}
                  </span>
                ))}
              </div>
            </div>

            <div className="dashboard-card flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <ClipboardCheck size={14} color="#237a3c" />
                <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                  Total de Inspeções
                </span>
              </div>
              <span className="text-[22px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {data.total_inspecoes}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                no período selecionado
              </span>
              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span className="size-1.5 shrink-0 rounded-full" style={{ background: '#3dbf65' }} />
                {data.inspecoes_finalizadas} finalizadas · {data.inspecoes_rascunhos} rascunhos
              </div>
            </div>
          </div>

          {/* Linha 2 — evolução do IQL + NCs por criticidade */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[3fr_2fr]">
            <div className="dashboard-card">
              <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                Evolução do IQL
              </p>
              <IqlAreaChart data={data.inspecoes_por_mes} />
            </div>

            <div className="dashboard-card">
              <div className="mb-3 flex items-center gap-1.5">
                <BarChart3 size={14} color="var(--text-primary)" />
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  NCs por criticidade
                </p>
              </div>
              <NcsCriticidadeBars data={data.ncs_por_criticidade} />
            </div>
          </div>

          {/* Linha 3 — por inspetor, ranking locais, ranking zeladores */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="dashboard-card">
              <div className="mb-3 flex items-center gap-1.5">
                <Users size={14} color="var(--text-primary)" />
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  Por inspetor
                </p>
              </div>
              <RankingBars
                barColor="#6dd98a"
                rows={data.inspecoes_por_inspetor.map((i) => ({
                  key: i.nome,
                  label: i.nome,
                  value: i.total,
                  trailing: `${i.total} · ${formatPercent(i.iql_medio)}`,
                }))}
              />
            </div>

            <div className="dashboard-card">
              <div className="mb-3 flex items-center gap-1.5">
                <MapPin size={14} color="var(--text-primary)" />
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  Ranking de locais
                </p>
              </div>
              <RankingBars
                barColor="#3dbf65"
                rows={data.ranking_locais.map((l, i) => ({
                  key: l.nome,
                  position: i + 1,
                  label: l.nome,
                  value: l.iql_medio,
                  trailing: formatPercent(l.iql_medio),
                }))}
              />
            </div>

            <div className="dashboard-card">
              <div className="mb-3 flex items-center gap-1.5">
                <UserCheck size={14} color="var(--text-primary)" />
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  Ranking de zeladores
                </p>
              </div>
              <RankingBars
                barColor="#3dbf65"
                rows={data.ranking_zeladores.map((z, i) => ({
                  key: z.nome,
                  position: i + 1,
                  label: z.nome,
                  value: z.iql_medio,
                  trailing: formatPercent(z.iql_medio),
                }))}
              />
            </div>
          </div>

          {/* Linha 4 — últimas inspeções */}
          <div className="dashboard-card">
            <div className="mb-3 flex items-center gap-1.5">
              <History size={14} color="var(--text-primary)" />
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                Últimas inspeções
              </p>
            </div>
            <div className="flex flex-col divide-y divide-[#eef1ee]">
              {data.ultimas_inspecoes.map((i) => (
                <Link
                  key={i.id}
                  href={`/inspecao/${i.id}/resumo`}
                  className="flex items-center gap-3 py-2.5 text-[13px] hover:opacity-70"
                >
                  <span className="size-2 shrink-0 rounded-full" style={{ background: statusDotColor(i.status) }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate" style={{ color: 'var(--text-primary)' }}>
                      {i.local}
                    </p>
                    <p className="truncate text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(i.data)} · {i.inspetor} · {i.zelador} · {formatStatus(i.status)}
                    </p>
                  </div>
                  <span className="shrink-0" style={{ color: 'var(--text-primary)' }}>
                    {i.status === 'rascunho' ? '—' : formatPercent(i.iql)}
                  </span>
                </Link>
              ))}
              {data.ultimas_inspecoes.length === 0 && (
                <p className="py-2 text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  Nenhuma inspeção no período.
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function DashboardGridSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dashboard-card flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[3fr_2fr]">
        <div className="dashboard-card">
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="dashboard-card">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="dashboard-card">
            <Skeleton className="h-32 w-full" />
          </div>
        ))}
      </div>
      <div className="dashboard-card">
        <Skeleton className="h-56 w-full" />
      </div>
    </div>
  )
}
