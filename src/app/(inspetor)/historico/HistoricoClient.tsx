'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GlassCard } from '@/components/shared/GlassCard'
import { formatDate, formatPercent, formatStatus } from '@/lib/utils/formatters'
import type { SelectOption } from '@/types/app'

interface InspecaoResumo {
  id: string
  data_inspecao: string
  status: string
  indice_qualidade: number | null
  indice_seguranca: number | null
  local: { nome: string } | null
  zelador: { nome: string } | null
}

interface HistoricoClientProps {
  locais: SelectOption[]
}

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos os status' },
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cancelada', label: 'Cancelada' },
]

export function HistoricoClient({ locais }: HistoricoClientProps) {
  const [status, setStatus] = useState('todos')
  const [localId, setLocalId] = useState('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [inspecoes, setInspecoes] = useState<InspecaoResumo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (status !== 'todos') params.set('status', status)
    if (localId !== 'todos') params.set('local_id', localId)
    if (dataInicio) params.set('data_inicio', dataInicio)
    if (dataFim) params.set('data_fim', dataFim)
    params.set('limit', '50')

    fetch(`/api/inspecoes?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => setInspecoes(json.data?.inspecoes ?? []))
      .finally(() => setLoading(false))
  }, [status, localId, dataInicio, dataFim])

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Histórico
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Todas as suas inspeções
        </p>
      </div>

      <GlassCard variant="sm" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">De</Label>
          <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Até</Label>
          <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Local</Label>
          <Select value={localId} onValueChange={(value) => setLocalId(value ?? 'todos')}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os locais</SelectItem>
              {locais.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-[11px]">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value ?? 'todos')}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-2">
        {loading && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Carregando...
          </p>
        )}
        {!loading && inspecoes.length === 0 && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Nenhuma inspeção encontrada.
          </p>
        )}
        {inspecoes.map((i) => (
          <Link key={i.id} href={`/inspecao/${i.id}/resumo`}>
            <GlassCard variant="sm" className="flex items-center justify-between hover:shadow-md transition-shadow">
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {i.local?.nome ?? '—'}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(i.data_inspecao)} · {i.zelador?.nome ?? '—'} · {formatStatus(i.status)}
                </p>
              </div>
              <div className="flex gap-3 text-right">
                <div>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    IQL
                  </p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatPercent(i.indice_qualidade)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    CS
                  </p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {formatPercent(i.indice_seguranca)}
                  </p>
                </div>
              </div>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
