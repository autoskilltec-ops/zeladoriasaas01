'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/GlassCard'
import { StepIndicator } from '@/components/inspecao/StepIndicator'
import { FotoUpload } from '@/components/inspecao/FotoUpload'
import { useInspecaoStore } from '@/store/inspecaoStore'

interface FotosStepClientProps {
  inspecaoId: string
  fotoInicialUrl: string | null
  fotoFinalUrl: string | null
}

export function FotosStepClient({ inspecaoId, fotoInicialUrl, fotoFinalUrl }: FotosStepClientProps) {
  const router = useRouter()
  const setFotoInicial = useInspecaoStore((s) => s.setFotoInicial)
  const setFotoFinal = useInspecaoStore((s) => s.setFotoFinal)

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator current={2} inspecaoId={inspecaoId} />

      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Fotos
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Registre o ambiente antes e depois (opcional)
        </p>
      </div>

      <FotoUpload
        label="Foto inicial do ambiente"
        inspecaoId={inspecaoId}
        tipo="inicial"
        previewUrl={fotoInicialUrl}
        onUploaded={(path) => setFotoInicial(path)}
      />

      <FotoUpload
        label="Foto final do ambiente"
        inspecaoId={inspecaoId}
        tipo="final"
        previewUrl={fotoFinalUrl}
        onUploaded={(path) => setFotoFinal(path)}
      />

      <GlassCard variant="sm" className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.push('/inspecao/nova')}
        >
          Voltar
        </Button>
        <Button
          type="button"
          className="btn-primary flex-1"
          onClick={() => router.push(`/inspecao/${inspecaoId}/avaliacao`)}
        >
          Avançar
        </Button>
      </GlassCard>
    </div>
  )
}
