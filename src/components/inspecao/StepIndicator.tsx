import Link from 'next/link'
import { cn } from '@/lib/utils'

const STEPS = [
  { step: 1, label: 'Visita', path: '' },
  { step: 2, label: 'Fotos', path: 'fotos' },
  { step: 3, label: 'Avaliação', path: 'avaliacao' },
  { step: 4, label: 'Segurança', path: 'seguranca' },
  { step: 5, label: 'NCs', path: 'nao-conformidades' },
  { step: 6, label: 'Reconhecimento', path: 'reconhecimento' },
  { step: 7, label: 'Resumo', path: 'resumo' },
]

interface StepIndicatorProps {
  current: number
  inspecaoId: string | null
}

export function StepIndicator({ current, inspecaoId }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {STEPS.map(({ step, label, path }) => {
        const done = step < current
        const active = step === current
        const href = step === 1 ? '/inspecao/nova' : inspecaoId ? `/inspecao/${inspecaoId}/${path}` : null
        const canNavigate = href && (done || active)

        const dot = (
          <div
            className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
            style={{
              background: active || done ? 'var(--forest-400)' : 'var(--forest-100)',
              color: active || done ? '#fff' : 'var(--text-muted)',
            }}
          >
            {step}
          </div>
        )

        return (
          <div key={step} className="flex items-center gap-1.5 shrink-0">
            {canNavigate ? (
              <Link href={href} className="flex flex-col items-center gap-1">
                {dot}
                <span
                  className={cn('text-[10px] whitespace-nowrap')}
                  style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {label}
                </span>
              </Link>
            ) : (
              <div className="flex flex-col items-center gap-1 opacity-50">
                {dot}
                <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                  {label}
                </span>
              </div>
            )}
            {step < STEPS.length && (
              <div className="h-px w-4" style={{ background: 'var(--forest-100)' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
