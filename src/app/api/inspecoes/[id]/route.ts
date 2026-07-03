import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { patchInspecaoSchema } from '@/lib/validations/inspecao'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { data, error: queryError } = await supabase
    .from('inspecoes')
    .select(
      `*, local:locais(nome, tipo, bloco, andar), zelador:zeladores(nome, matricula),
       inspetor:usuarios(nome, email),
       avaliacoes_limpeza(criterio_id, nota, observacao),
       seguranca_checklist(item_id, conforme, observacao),
       epis_inspecao(status_geral, equipamentos_bons, observacoes, epis_ausentes(epi_id)),
       nao_conformidades(*),
       reconhecimentos(*)`
    )
    .eq('id', id)
    .single()

  if (queryError || !data) return err('Inspeção não encontrada', 404)

  return ok(data)
}

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const body = await req.json().catch(() => null)
  const parsed = patchInspecaoSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { data, error: updateError } = await supabase
    .from('inspecoes')
    .update(parsed.data)
    .eq('id', id)
    .select('id')
    .single()

  if (updateError || !data) return err(updateError?.message ?? 'Erro ao atualizar', 500)

  return ok(data)
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { error: deleteError } = await supabase
    .from('inspecoes')
    .update({ status: 'cancelada' })
    .eq('id', id)

  if (deleteError) return err(deleteError.message, 500)

  return ok({ id })
}
