import { z } from 'zod'
import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

const schema = z.object({
  nome: z.string().min(2).max(100),
  obrigatorio: z.boolean().default(true),
})

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { data, error: queryError } = await supabase
    .from('epis_lista')
    .select('id, nome, obrigatorio, ordem, ativo')
    .order('ordem')

  if (queryError) return err(queryError.message, 500)

  return ok(data)
}

export async function POST(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { count } = await supabase.from('epis_lista').select('id', { count: 'exact', head: true })

  const { data, error: insertError } = await supabase
    .from('epis_lista')
    .insert({ ...parsed.data, organizacao_id: user.organizacao_id, ordem: count ?? 0 })
    .select('id, nome, obrigatorio, ordem, ativo')
    .single()

  if (insertError || !data) return err(insertError?.message ?? 'Erro ao criar EPI', 500)

  return ok(data, 201)
}
