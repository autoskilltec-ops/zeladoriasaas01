import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { AvaliacaoStepClient } from './AvaliacaoStepClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AvaliacaoPage({ params }: PageProps) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const [{ data: criterios }, { data: avaliacoes }] = await Promise.all([
    supabase
      .from('criterios_avaliacao')
      .select('id, nome, peso, ordem')
      .eq('ativo', true)
      .order('ordem'),
    supabase.from('avaliacoes_limpeza').select('criterio_id, nota').eq('inspecao_id', id),
  ])

  const notasIniciais = Object.fromEntries((avaliacoes ?? []).map((a) => [a.criterio_id, a.nota]))

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <AvaliacaoStepClient
        inspecaoId={id}
        criterios={criterios ?? []}
        notasIniciais={notasIniciais}
      />
    </div>
  )
}
