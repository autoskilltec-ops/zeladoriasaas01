'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star, ThumbsUp, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { GlassCard } from '@/components/shared/GlassCard'
import { StepIndicator } from '@/components/inspecao/StepIndicator'
import type { ReconhecimentoNivel } from '@/types/database'

const NIVEIS: { value: ReconhecimentoNivel; label: string; icon: typeof Star }[] = [
  { value: 'excelente', label: 'Excelente', icon: Star },
  { value: 'bom_exemplo', label: 'Bom exemplo', icon: ThumbsUp },
  { value: 'merece_reconhecimento', label: 'Merece reconhecimento', icon: Trophy },
]

interface ReconhecimentoStepClientProps {
  inspecaoId: string
  zeladorId: string
  zeladorNome: string
  nivelInicial: ReconhecimentoNivel | null
  descricaoInicial: string
}

export function ReconhecimentoStepClient({
  inspecaoId,
  zeladorId,
  zeladorNome,
  nivelInicial,
  descricaoInicial,
}: ReconhecimentoStepClientProps) {
  const router = useRouter()
  const [houve, setHouve] = useState<boolean | null>(nivelInicial ? true : null)
  const [nivel, setNivel] = useState<ReconhecimentoNivel | null>(nivelInicial)
  const [descricao, setDescricao] = useState(descricaoInicial)
  const [saving, setSaving] = useState(false)

  async function avancar() {
    if (houve && nivel) {
      setSaving(true)
      try {
        const res = await fetch('/api/reconhecimentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inspecao_id: inspecaoId,
            zelador_id: zeladorId,
            nivel,
            descricao: descricao || undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error?.message ?? 'Erro ao salvar reconhecimento')
          return
        }
      } finally {
        setSaving(false)
      }
    }
    router.push(`/inspecao/${inspecaoId}/resumo`)
  }

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator current={6} inspecaoId={inspecaoId} />

      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Reconhecimento
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Algum destaque positivo de {zeladorNome}?
        </p>
      </div>

      <GlassCard>
        <p className="mb-2 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Houve algum destaque positivo?
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            style={
              houve === true
                ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)', borderWidth: 2 }
                : undefined
            }
            onClick={() => setHouve(true)}
          >
            Sim
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            style={
              houve === false
                ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)', borderWidth: 2 }
                : undefined
            }
            onClick={() => {
              setHouve(false)
              setNivel(null)
            }}
          >
            Não
          </Button>
        </div>
      </GlassCard>

      {houve && (
        <GlassCard variant="accent" className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {NIVEIS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setNivel(value)}
                className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
                style={{
                  borderColor: nivel === value ? 'var(--forest-600)' : '#dce3de',
                  background: nivel === value ? 'var(--forest-50)' : 'transparent',
                }}
              >
                <Icon size={18} style={{ color: 'var(--gold)' }} />
                <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Descrição (opcional)</Label>
            <Textarea
              rows={3}
              maxLength={500}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>

          <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
            🏆 Esse registro alimenta o mural de reconhecimento!
          </p>
        </GlassCard>
      )}

      <GlassCard variant="sm" className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/inspecao/${inspecaoId}/nao-conformidades`)}
        >
          Voltar
        </Button>
        <Button
          type="button"
          className="btn-primary flex-1"
          disabled={houve === null || (houve && !nivel) || saving}
          onClick={avancar}
        >
          {saving ? 'Salvando...' : 'Avançar'}
        </Button>
      </GlassCard>
    </div>
  )
}
