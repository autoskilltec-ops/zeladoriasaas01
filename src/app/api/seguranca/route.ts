import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { segurancaSchema } from '@/lib/validations/inspecao'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const body = await req.json().catch(() => null)
  const parsed = segurancaSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { inspecao_id, respostas, status_geral_epi, epis_ausentes, equipamentos_bons, observacoes } =
    parsed.data

  if (respostas.length > 0) {
    const { error: checklistError } = await supabase
      .from('seguranca_checklist')
      .upsert(
        respostas.map((r) => ({
          inspecao_id,
          item_id: r.item_id,
          conforme: r.conforme,
        })),
        { onConflict: 'inspecao_id,item_id' }
      )
    if (checklistError) return err(checklistError.message, 500)
  }

  const { data: epiInspecao, error: epiError } = await supabase
    .from('epis_inspecao')
    .upsert(
      {
        inspecao_id,
        status_geral: status_geral_epi,
        equipamentos_bons,
        observacoes: observacoes ?? null,
      },
      { onConflict: 'inspecao_id' }
    )
    .select('id')
    .single()

  if (epiError || !epiInspecao) return err(epiError?.message ?? 'Erro ao salvar EPIs', 500)

  await supabase.from('epis_ausentes').delete().eq('epi_inspecao_id', epiInspecao.id)

  if (epis_ausentes && epis_ausentes.length > 0) {
    const { error: ausentesError } = await supabase.from('epis_ausentes').insert(
      epis_ausentes.map((epiId) => ({
        epi_inspecao_id: epiInspecao.id,
        epi_id: epiId,
      }))
    )
    if (ausentesError) return err(ausentesError.message, 500)
  }

  return ok({ inspecao_id })
}
