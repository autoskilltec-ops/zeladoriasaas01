import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { avaliacoesSchema } from '@/lib/validations/inspecao'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const body = await req.json().catch(() => null)
  const parsed = avaliacoesSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { inspecao_id, avaliacoes } = parsed.data

  const { error: upsertError } = await supabase
    .from('avaliacoes_limpeza')
    .upsert(
      avaliacoes.map((a) => ({ inspecao_id, criterio_id: a.criterio_id, nota: a.nota })),
      { onConflict: 'inspecao_id,criterio_id' }
    )

  if (upsertError) return err(upsertError.message, 500)

  return ok({ inspecao_id })
}
