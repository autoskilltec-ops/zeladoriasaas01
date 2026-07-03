'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/GlassCard'
import { StepIndicator } from '@/components/inspecao/StepIndicator'
import { ResumoCard } from '@/components/inspecao/ResumoCard'
import { useInspecaoStore } from '@/store/inspecaoStore'
import type { CriticidadeNivel } from '@/types/database'

interface ResumoStepClientProps {
  inspecaoId: string
  jaFinalizada: boolean
  local: string
  dataHora: string
  inspetor: string
  zelador: string
  iql: number
  cs: number
  totalNc: number
  criticidadeMaisAlta: CriticidadeNivel | null
}

export function ResumoStepClient({
  inspecaoId,
  jaFinalizada,
  local,
  dataHora,
  inspetor,
  zelador,
  iql,
  cs,
  totalNc,
  criticidadeMaisAlta,
}: ResumoStepClientProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const reset = useInspecaoStore((s) => s.reset)

  async function confirmar() {
    setSaving(true)
    try {
      const res = await fetch(`/api/inspecoes/${inspecaoId}/finalizar`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao finalizar inspeção')
        return
      }
      reset()
      toast.success('Inspeção finalizada com sucesso!')
      router.push('/dashboard')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator current={7} inspecaoId={inspecaoId} />

      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Resumo
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Confira os dados antes de enviar
        </p>
      </div>

      <ResumoCard
        local={local}
        dataHora={dataHora}
        inspetor={inspetor}
        zelador={zelador}
        iql={iql}
        cs={cs}
        totalNc={totalNc}
        criticidadeMaisAlta={criticidadeMaisAlta}
      />

      {jaFinalizada && (
        <GlassCard variant="accent">
          <p className="text-[13px]" style={{ color: 'var(--forest-700)' }}>
            Esta inspeção já foi finalizada.
          </p>
        </GlassCard>
      )}

      <GlassCard variant="sm" className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/inspecao/${inspecaoId}/reconhecimento`)}
        >
          Voltar e editar
        </Button>
        <Button
          type="button"
          className="btn-primary flex-1"
          disabled={saving || jaFinalizada}
          onClick={confirmar}
        >
          {saving ? 'Enviando...' : jaFinalizada ? 'Já enviada' : 'Confirmar e Enviar'}
        </Button>
      </GlassCard>
    </div>
  )
}
