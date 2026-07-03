'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GlassCard } from '@/components/shared/GlassCard'
import { CritBadge } from '@/components/shared/CritBadge'
import { supabase } from '@/lib/supabase/client'
import { formatDate, formatPercent, formatStatus } from '@/lib/utils/formatters'
import { criticidadeMaisAlta } from '@/lib/utils/calculos'
import type { SelectOption } from '@/types/app'
import type { CriticidadeNivel } from '@/types/database'

interface InspecaoRow {
  id: string
  data_inspecao: string
  status: string
  indice_qualidade: number | null
  indice_seguranca: number | null
  local: { nome: string } | null
  zelador: { nome: string } | null
  inspetor: { nome: string } | null
}

interface InspecaoComNc extends InspecaoRow {
  nc_total: number
  criticidade_maior: CriticidadeNivel | null
}

const SEVERIDADE: Record<CriticidadeNivel, number> = { critico: 4, alto: 3, medio: 2, baixo: 1 }

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cancelada', label: 'Cancelada' },
]

const CRITICIDADE_OPTIONS = [
  { value: 'todas', label: 'Qualquer criticidade' },
  { value: 'baixo', label: 'Baixo ou maior' },
  { value: 'medio', label: 'Médio ou maior' },
  { value: 'alto', label: 'Alto ou maior' },
  { value: 'critico', label: 'Apenas crítico' },
]

interface RelatoriosClientProps {
  inspetores: SelectOption[]
  locais: SelectOption[]
  zeladores: SelectOption[]
}

export function RelatoriosClient({ inspetores, locais, zeladores }: RelatoriosClientProps) {
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [inspetorId, setInspetorId] = useState('todos')
  const [localId, setLocalId] = useState('todos')
  const [zeladorId, setZeladorId] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [criticidadeMinima, setCriticidadeMinima] = useState('todas')
  const [inspecoes, setInspecoes] = useState<InspecaoComNc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      const params = new URLSearchParams({ limit: '100' })
      if (status !== 'todos') params.set('status', status)
      if (localId !== 'todos') params.set('local_id', localId)
      if (inspetorId !== 'todos') params.set('inspetor_id', inspetorId)
      if (zeladorId !== 'todos') params.set('zelador_id', zeladorId)
      if (dataInicio) params.set('data_inicio', dataInicio)
      if (dataFim) params.set('data_fim', dataFim)

      const res = await fetch(`/api/inspecoes?${params.toString()}`)
      const json = await res.json()
      const rows: InspecaoRow[] = json.data?.inspecoes ?? []

      const ids = rows.map((r) => r.id)
      const ncMap = new Map<string, CriticidadeNivel[]>()
      if (ids.length > 0) {
        const { data: ncs } = await supabase
          .from('nao_conformidades')
          .select('inspecao_id, criticidade')
          .in('inspecao_id', ids)
        for (const nc of ncs ?? []) {
          const lista = ncMap.get(nc.inspecao_id) ?? []
          lista.push(nc.criticidade as CriticidadeNivel)
          ncMap.set(nc.inspecao_id, lista)
        }
      }

      setInspecoes(
        rows.map((r) => {
          const criticidades = ncMap.get(r.id) ?? []
          return {
            ...r,
            nc_total: criticidades.length,
            criticidade_maior: criticidadeMaisAlta(criticidades),
          }
        })
      )
      setLoading(false)
    }
    carregar()
  }, [status, localId, inspetorId, zeladorId, dataInicio, dataFim])

  const filtradas = useMemo(() => {
    if (criticidadeMinima === 'todas') return inspecoes
    const min = SEVERIDADE[criticidadeMinima as CriticidadeNivel]
    return inspecoes.filter((i) => i.criticidade_maior && SEVERIDADE[i.criticidade_maior] >= min)
  }, [inspecoes, criticidadeMinima])

  function exportarCsv() {
    const header = ['Data', 'Local', 'Inspetor', 'Zelador', 'IQL', 'CS', 'NCs', 'Criticidade maior', 'Status']
    const linhas = filtradas.map((i) => [
      formatDate(i.data_inspecao),
      i.local?.nome ?? '',
      i.inspetor?.nome ?? '',
      i.zelador?.nome ?? '',
      i.indice_qualidade ?? '',
      i.indice_seguranca ?? '',
      i.nc_total,
      i.criticidade_maior ?? '',
      formatStatus(i.status),
    ])
    const csv = [header, ...linhas]
      .map((linha) => linha.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-inspecoes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Relatórios
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Explore e exporte os dados das inspeções
          </p>
        </div>
        <Button variant="outline" onClick={exportarCsv} disabled={filtradas.length === 0}>
          Exportar CSV
        </Button>
      </div>

      <GlassCard variant="sm" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">De</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Até</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Inspetor</Label>
          <Select value={inspetorId} onValueChange={(v) => setInspetorId(v ?? 'todos')}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {inspetores.map((i) => <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Local</Label>
          <Select value={localId} onValueChange={(v) => setLocalId(v ?? 'todos')}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {locais.map((l) => <SelectItem key={l.id} value={l.id}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Zelador</Label>
          <Select value={zeladorId} onValueChange={(v) => setZeladorId(v ?? 'todos')}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {zeladores.map((z) => <SelectItem key={z.id} value={z.id}>{z.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v ?? 'todos')}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <Label className="text-[11px]">Criticidade mínima das NCs</Label>
          <Select value={criticidadeMinima} onValueChange={(v) => setCriticidadeMinima(v ?? 'todas')}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CRITICIDADE_OPTIONS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      <GlassCard>
        {loading && <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Carregando...</p>}
        {!loading && filtradas.length === 0 && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Nenhuma inspeção encontrada.</p>
        )}
        {!loading && filtradas.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b" style={{ borderColor: '#dce3de' }}>
                  {['Data', 'Local', 'Inspetor', 'Zelador', 'IQL', 'CS', 'NCs', 'Criticidade maior'].map((h) => (
                    <th key={h} className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map((i) => (
                  <tr key={i.id} className="border-b last:border-0" style={{ borderColor: '#eef1ee' }}>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      <Link href={`/inspecao/${i.id}/resumo`} className="hover:underline" style={{ color: 'var(--forest-700)' }}>
                        {formatDate(i.data_inspecao)}
                      </Link>
                    </td>
                    <td className="py-2 pr-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{i.local?.nome ?? '—'}</td>
                    <td className="py-2 pr-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{i.inspetor?.nome ?? '—'}</td>
                    <td className="py-2 pr-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{i.zelador?.nome ?? '—'}</td>
                    <td className="py-2 pr-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{formatPercent(i.indice_qualidade)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{formatPercent(i.indice_seguranca)}</td>
                    <td className="py-2 pr-3 whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{i.nc_total}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {i.criticidade_maior ? <CritBadge criticidade={i.criticidade_maior} /> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
