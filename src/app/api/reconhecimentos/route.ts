import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { reconhecimentoSchema } from '@/lib/validations/inspecao'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const body = await req.json().catch(() => null)
  const parsed = reconhecimentoSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { data, error: upsertError } = await supabase
    .from('reconhecimentos')
    .upsert(parsed.data, { onConflict: 'inspecao_id' })
    .select('id')
    .single()

  if (upsertError || !data) return err(upsertError?.message ?? 'Erro ao registrar', 500)

  return ok(data, 201)
}
