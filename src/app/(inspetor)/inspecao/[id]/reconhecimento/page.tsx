import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { ReconhecimentoStepClient } from './ReconhecimentoStepClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReconhecimentoPage({ params }: PageProps) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const { data: inspecao } = await supabase
    .from('inspecoes')
    .select('zelador_id, zeladores(nome)')
    .eq('id', id)
    .single()

  const { data: existente } = await supabase
    .from('reconhecimentos')
    .select('nivel, descricao')
    .eq('inspecao_id', id)
    .maybeSingle()

  if (!inspecao) redirect('/inspecao/nova')

  const zeladorNome = (inspecao as unknown as { zeladores: { nome: string } | null }).zeladores?.nome

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <ReconhecimentoStepClient
        inspecaoId={id}
        zeladorId={inspecao.zelador_id}
        zeladorNome={zeladorNome ?? 'o zelador'}
        nivelInicial={existente?.nivel ?? null}
        descricaoInicial={existente?.descricao ?? ''}
      />
    </div>
  )
}
