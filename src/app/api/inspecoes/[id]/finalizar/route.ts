import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function POST(_req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { data: inspecao, error: fetchError } = await supabase
    .from('inspecoes')
    .select('id, inspetor_id, status')
    .eq('id', id)
    .single()

  if (fetchError || !inspecao) return err('Inspeção não encontrada', 404)
  if (inspecao.status === 'finalizada') return err('Inspeção já finalizada', 409)

  const { count: avaliacoesCount } = await supabase
    .from('avaliacoes_limpeza')
    .select('id', { count: 'exact', head: true })
    .eq('inspecao_id', id)

  if (!avaliacoesCount) {
    return err('Preencha ao menos uma avaliação de limpeza antes de finalizar', 422)
  }

  const { error: rpcError } = await supabase.rpc('calcular_indices_inspecao', {
    p_inspecao_id: id,
  })
  if (rpcError) return err(rpcError.message, 500)

  return ok({ id })
}
