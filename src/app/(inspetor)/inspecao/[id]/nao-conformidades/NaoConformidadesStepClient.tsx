'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/GlassCard'
import { StepIndicator } from '@/components/inspecao/StepIndicator'
import { CritBadge } from '@/components/shared/CritBadge'
import { NcForm, type NcFormValues } from '@/components/inspecao/NcForm'
import { formatNcTipo, formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'
import type { SelectOption } from '@/types/app'
import type { CriticidadeNivel, NcTipo } from '@/types/database'

interface NcExistente {
  id: string
  tipo: NcTipo
  descricao: string
  criticidade: CriticidadeNivel
  acao_corretiva: string
  prazo_correcao: string
}

interface NaoConformidadesStepClientProps {
  inspecaoId: string
  ncsExistentes: NcExistente[]
  responsaveis: SelectOption[]
}

export function NaoConformidadesStepClient({
  inspecaoId,
  ncsExistentes,
  responsaveis,
}: NaoConformidadesStepClientProps) {
  const router = useRouter()
  const [houveNc, setHouveNc] = useState<boolean | null>(ncsExistentes.length > 0 ? true : null)
  const [ncs, setNcs] = useState<NcExistente[]>(ncsExistentes)
  const [saving, setSaving] = useState(false)

  async function addNc(values: NcFormValues) {
    setSaving(true)
    try {
      const res = await fetch('/api/nao-conformidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, inspecao_id: inspecaoId }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao adicionar não conformidade')
        return
      }
      setNcs((prev) => [...prev, { id: json.data.id, ...values }])
      toast.success('Não conformidade adicionada')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator current={5} inspecaoId={inspecaoId} />

      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Não Conformidades
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Registre problemas encontrados durante a inspeção
        </p>
      </div>

      <GlassCard>
        <p className="mb-2 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Houve não conformidades?
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className={cn('flex-1')}
            style={
              houveNc === true
                ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)', borderWidth: 2 }
                : undefined
            }
            onClick={() => setHouveNc(true)}
          >
            Sim
          </Button>
          <Button
            type="button"
            variant="outline"
            className={cn('flex-1')}
            style={
              houveNc === false
                ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)', borderWidth: 2 }
                : undefined
            }
            onClick={() => setHouveNc(false)}
          >
            Não
          </Button>
        </div>
      </GlassCard>

      {houveNc && (
        <>
          {ncs.length > 0 && (
            <div className="flex flex-col gap-2">
              {ncs.map((nc) => (
                <GlassCard key={nc.id} variant="sm" className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {formatNcTipo(nc.tipo)}
                    </span>
                    <CritBadge criticidade={nc.criticidade} />
                  </div>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    {nc.descricao}
                  </p>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Prazo: {formatDate(nc.prazo_correcao)}
                  </p>
                </GlassCard>
              ))}
            </div>
          )}

          <GlassCard>
            <NcForm responsaveis={responsaveis} onAdd={addNc} saving={saving} />
          </GlassCard>
        </>
      )}

      <GlassCard variant="sm" className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push(`/inspecao/${inspecaoId}/seguranca`)}
        >
          Voltar
        </Button>
        <Button
          type="button"
          className="btn-primary flex-1"
          disabled={houveNc === null}
          onClick={() => router.push(`/inspecao/${inspecaoId}/reconhecimento`)}
        >
          Avançar
        </Button>
      </GlassCard>
    </div>
  )
}
