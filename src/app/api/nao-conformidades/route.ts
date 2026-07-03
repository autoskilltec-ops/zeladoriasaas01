import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { naoConformidadeSchema } from '@/lib/validations/inspecao'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const body = await req.json().catch(() => null)
  const parsed = naoConformidadeSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { data, error: insertError } = await supabase
    .from('nao_conformidades')
    .insert({ ...parsed.data, organizacao_id: user.organizacao_id })
    .select('id')
    .single()

  if (insertError || !data) return err(insertError?.message ?? 'Erro ao criar NC', 500)

  return ok(data, 201)
}
