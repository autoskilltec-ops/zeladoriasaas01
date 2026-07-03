import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { calcularIQL, calcularCS, criticidadeMaisAlta } from '@/lib/utils/calculos'
import { formatDateTime } from '@/lib/utils/formatters'
import { ResumoStepClient } from './ResumoStepClient'
import type { CriticidadeNivel } from '@/types/database'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ResumoPage({ params }: PageProps) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const [
    { data: inspecao },
    { data: avaliacoes },
    { data: checklist },
    { data: itensChecklist },
    { data: ncs },
  ] = await Promise.all([
    supabase
      .from('inspecoes')
      .select(
        'id, data_inspecao, hora_inicio, status, locais(nome), zeladores(nome), usuarios(nome)'
      )
      .eq('id', id)
      .single(),
    supabase
      .from('avaliacoes_limpeza')
      .select('nota, criterios_avaliacao(peso)')
      .eq('inspecao_id', id),
    supabase.from('seguranca_checklist').select('conforme').eq('inspecao_id', id),
    supabase.from('checklist_seguranca_itens').select('id').eq('ativo', true),
    supabase.from('nao_conformidades').select('criticidade').eq('inspecao_id', id),
  ])

  if (!inspecao) redirect('/inspecao/nova')

  const iql = calcularIQL(
    (avaliacoes ?? []).map((a) => ({
      nota: a.nota,
      peso: (a.criterios_avaliacao as unknown as { peso: number } | null)?.peso ?? 1,
    }))
  )

  const totalItensChecklist = (itensChecklist ?? []).length
  const respostasChecklist = checklist ?? []
  const cs =
    totalItensChecklist > 0
      ? calcularCS(respostasChecklist.map((r) => ({ conforme: r.conforme })))
      : 0

  const criticidades = (ncs ?? []).map((nc) => nc.criticidade as CriticidadeNivel)
  const maisAlta = criticidadeMaisAlta(criticidades)

  const local = (inspecao as unknown as { locais: { nome: string } | null }).locais?.nome ?? '—'
  const zelador =
    (inspecao as unknown as { zeladores: { nome: string } | null }).zeladores?.nome ?? '—'
  const inspetor =
    (inspecao as unknown as { usuarios: { nome: string } | null }).usuarios?.nome ?? '—'

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <ResumoStepClient
        inspecaoId={id}
        jaFinalizada={inspecao.status === 'finalizada'}
        local={local}
        dataHora={formatDateTime(inspecao.data_inspecao)}
        inspetor={inspetor}
        zelador={zelador}
        iql={iql}
        cs={cs}
        totalNc={(ncs ?? []).length}
        criticidadeMaisAlta={maisAlta}
      />
    </div>
  )
}
