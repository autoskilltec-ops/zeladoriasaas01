'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/shared/GlassCard'
import { StepIndicator } from '@/components/inspecao/StepIndicator'
import { ChecklistItem } from '@/components/inspecao/ChecklistItem'
import { CircularProgress } from '@/components/shared/CircularProgress'
import { calcularCS, classificarIndice } from '@/lib/utils/calculos'
import { cn } from '@/lib/utils'
import type { EpiStatus } from '@/types/database'

interface ChecklistItemData {
  id: string
  descricao: string
  obrigatorio: boolean
  ordem: number
}

interface EpiItemData {
  id: string
  nome: string
  obrigatorio: boolean
  ordem: number
}

interface SegurancaStepClientProps {
  inspecaoId: string
  itens: ChecklistItemData[]
  episLista: EpiItemData[]
  respostasIniciais: Record<string, boolean>
  statusGeralInicial: EpiStatus | null
  equipamentosBonsInicial: boolean | null
  observacoesInicial: string
  episAusentesIniciais: string[]
}

const EPI_OPTIONS: { value: EpiStatus; label: string }[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'parcialmente', label: 'Parcialmente' },
  { value: 'nao', label: 'Não' },
]

export function SegurancaStepClient({
  inspecaoId,
  itens,
  episLista,
  respostasIniciais,
  statusGeralInicial,
  equipamentosBonsInicial,
  observacoesInicial,
  episAusentesIniciais,
}: SegurancaStepClientProps) {
  const router = useRouter()
  const [respostas, setRespostas] = useState<Record<string, boolean>>(respostasIniciais)
  const [statusGeral, setStatusGeral] = useState<EpiStatus | null>(statusGeralInicial)
  const [episAusentes, setEpisAusentes] = useState<string[]>(episAusentesIniciais)
  const [equipamentosBons, setEquipamentosBons] = useState<boolean | null>(equipamentosBonsInicial)
  const [observacoes, setObservacoes] = useState(observacoesInicial)
  const [saving, setSaving] = useState(false)

  const cs = useMemo(() => {
    return calcularCS(itens.map((item) => ({ conforme: respostas[item.id] ?? false })))
  }, [itens, respostas])

  const classificacao = classificarIndice(cs)

  function toggleEpiAusente(id: string) {
    setEpisAusentes((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]))
  }

  async function salvarEAvancar() {
    if (!statusGeral) {
      toast.error('Informe o status geral de EPIs')
      return
    }
    if (equipamentosBons === null) {
      toast.error('Informe se os equipamentos estão em boas condições')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/seguranca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspecao_id: inspecaoId,
          respostas: itens.map((item) => ({
            item_id: item.id,
            conforme: respostas[item.id] ?? false,
          })),
          status_geral_epi: statusGeral,
          epis_ausentes: statusGeral === 'sim' ? [] : episAusentes,
          equipamentos_bons: equipamentosBons,
          observacoes: observacoes || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao salvar')
        return
      }
      router.push(`/inspecao/${inspecaoId}/nao-conformidades`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator current={4} inspecaoId={inspecaoId} />

      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Segurança e EPIs
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Checklist de segurança do zelador
        </p>
      </div>

      <GlassCard variant="accent" className="flex items-center gap-4">
        <CircularProgress value={cs} color={classificacao.color} />
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Conformidade de segurança
          </p>
          <p className="text-[13px]" style={{ color: classificacao.color }}>
            {classificacao.label}
          </p>
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col divide-y divide-[#dce3de]">
        {itens.map((item) => (
          <ChecklistItem
            key={item.id}
            label={item.descricao}
            checked={respostas[item.id] ?? false}
            onChange={(checked) => setRespostas((prev) => ({ ...prev, [item.id]: checked }))}
          />
        ))}
        {itens.length === 0 && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Nenhum item de checklist configurado.
          </p>
        )}
      </GlassCard>

      <GlassCard className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Todos os EPIs necessários estavam sendo utilizados?</Label>
          <div className="flex gap-2">
            {EPI_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant="outline"
                className={cn('flex-1')}
                style={
                  statusGeral === opt.value
                    ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)', borderWidth: 2 }
                    : undefined
                }
                onClick={() => setStatusGeral(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {statusGeral && statusGeral !== 'sim' && (
          <div className="flex flex-col gap-2">
            <Label>Quais EPIs estavam ausentes?</Label>
            <div className="flex flex-col divide-y divide-[#dce3de]">
              {episLista.map((epi) => (
                <ChecklistItem
                  key={epi.id}
                  label={epi.nome}
                  checked={episAusentes.includes(epi.id)}
                  onChange={() => toggleEpiAusente(epi.id)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label>Equipamentos em boas condições?</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              style={
                equipamentosBons === true
                  ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)', borderWidth: 2 }
                  : undefined
              }
              onClick={() => setEquipamentosBons(true)}
            >
              Sim
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              style={
                equipamentosBons === false
                  ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)', borderWidth: 2 }
                  : undefined
              }
              onClick={() => setEquipamentosBons(false)}
            >
              Não
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Observações (opcional)</Label>
          <Textarea
            rows={3}
            maxLength={500}
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </div>
      </GlassCard>

      <GlassCard variant="sm" className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/inspecao/${inspecaoId}/avaliacao`)}
        >
          Voltar
        </Button>
        <Button type="button" className="btn-primary flex-1" onClick={salvarEAvancar} disabled={saving}>
          {saving ? 'Salvando...' : 'Avançar'}
        </Button>
      </GlassCard>
    </div>
  )
}
