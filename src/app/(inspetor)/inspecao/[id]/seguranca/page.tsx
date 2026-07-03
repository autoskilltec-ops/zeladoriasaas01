import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { SegurancaStepClient } from './SegurancaStepClient'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SegurancaPage({ params }: PageProps) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const [{ data: itens }, { data: episLista }, { data: respostas }, { data: epiInspecao }] =
    await Promise.all([
      supabase
        .from('checklist_seguranca_itens')
        .select('id, descricao, obrigatorio, ordem')
        .eq('ativo', true)
        .order('ordem'),
      supabase.from('epis_lista').select('id, nome, obrigatorio, ordem').eq('ativo', true).order('ordem'),
      supabase.from('seguranca_checklist').select('item_id, conforme').eq('inspecao_id', id),
      supabase
        .from('epis_inspecao')
        .select('id, status_geral, equipamentos_bons, observacoes, epis_ausentes(epi_id)')
        .eq('inspecao_id', id)
        .maybeSingle(),
    ])

  const respostasIniciais = Object.fromEntries((respostas ?? []).map((r) => [r.item_id, r.conforme]))
  const episAusentesIniciais = (epiInspecao?.epis_ausentes ?? []).map(
    (e: { epi_id: string }) => e.epi_id
  )

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <SegurancaStepClient
        inspecaoId={id}
        itens={itens ?? []}
        episLista={episLista ?? []}
        respostasIniciais={respostasIniciais}
        statusGeralInicial={epiInspecao?.status_geral ?? null}
        equipamentosBonsInicial={epiInspecao?.equipamentos_bons ?? null}
        observacoesInicial={epiInspecao?.observacoes ?? ''}
        episAusentesIniciais={episAusentesIniciais}
      />
    </div>
  )
}
