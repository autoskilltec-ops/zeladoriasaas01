'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/GlassCard'
import { StepIndicator } from '@/components/inspecao/StepIndicator'
import { StarRating } from '@/components/shared/StarRating'
import { CircularProgress } from '@/components/shared/CircularProgress'
import { calcularIQL, classificarIndice } from '@/lib/utils/calculos'

interface Criterio {
  id: string
  nome: string
  peso: number
  ordem: number
}

interface AvaliacaoStepClientProps {
  inspecaoId: string
  criterios: Criterio[]
  notasIniciais: Record<string, number>
}

export function AvaliacaoStepClient({
  inspecaoId,
  criterios,
  notasIniciais,
}: AvaliacaoStepClientProps) {
  const router = useRouter()
  const [notas, setNotas] = useState<Record<string, number>>(notasIniciais)
  const [saving, setSaving] = useState(false)

  const iql = useMemo(() => {
    const avaliadas = criterios
      .filter((c) => notas[c.id] !== undefined)
      .map((c) => ({ nota: notas[c.id], peso: c.peso }))
    return calcularIQL(avaliadas)
  }, [criterios, notas])

  const classificacao = classificarIndice(iql)
  const todasAvaliadas = criterios.every((c) => notas[c.id] !== undefined)

  async function salvarEAvancar() {
    if (!todasAvaliadas) {
      toast.error('Avalie todos os critérios antes de avançar')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspecao_id: inspecaoId,
          avaliacoes: criterios.map((c) => ({ criterio_id: c.id, nota: notas[c.id] })),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao salvar avaliação')
        return
      }
      router.push(`/inspecao/${inspecaoId}/seguranca`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator current={3} inspecaoId={inspecaoId} />

      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Avaliação da Limpeza
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Avalie cada critério de 1 a 5 estrelas
        </p>
      </div>

      <GlassCard variant="accent" className="flex items-center gap-4">
        <CircularProgress value={iql} color={classificacao.color} />
        <div>
          <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Índice de qualidade
          </p>
          <p className="text-[13px]" style={{ color: classificacao.color }}>
            {classificacao.label}
          </p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Meta: ≥ 90%
          </p>
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col gap-4">
        {criterios.map((criterio) => (
          <div key={criterio.id} className="flex items-center justify-between gap-3">
            <span className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
              {criterio.nome}
            </span>
            <StarRating
              value={notas[criterio.id] ?? 0}
              onChange={(v) => setNotas((prev) => ({ ...prev, [criterio.id]: v }))}
            />
          </div>
        ))}
        {criterios.length === 0 && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Nenhum critério de avaliação configurado.
          </p>
        )}
      </GlassCard>

      <GlassCard variant="sm" className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/inspecao/${inspecaoId}/fotos`)}
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
