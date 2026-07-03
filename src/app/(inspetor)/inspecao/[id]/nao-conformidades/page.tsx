import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { NaoConformidadesStepClient } from './NaoConformidadesStepClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NaoConformidadesPage({ params }: PageProps) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const [{ data: ncsExistentes }, { data: usuarios }] = await Promise.all([
    supabase
      .from('nao_conformidades')
      .select('id, tipo, descricao, criticidade, acao_corretiva, prazo_correcao')
      .eq('inspecao_id', id)
      .order('created_at'),
    supabase.from('usuarios').select('id, nome').eq('ativo', true).order('nome'),
  ])

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <NaoConformidadesStepClient
        inspecaoId={id}
        ncsExistentes={ncsExistentes ?? []}
        responsaveis={(usuarios ?? []).map((u) => ({ id: u.id, label: u.nome }))}
      />
    </div>
  )
}
