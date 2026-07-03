import { z } from 'zod'
import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

const schema = z.object({
  descricao: z.string().min(2).max(200),
  obrigatorio: z.boolean().default(true),
})

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { data, error: queryError } = await supabase
    .from('checklist_seguranca_itens')
    .select('id, descricao, obrigatorio, ordem, ativo')
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

  const { count } = await supabase
    .from('checklist_seguranca_itens')
    .select('id', { count: 'exact', head: true })

  const { data, error: insertError } = await supabase
    .from('checklist_seguranca_itens')
    .insert({ ...parsed.data, organizacao_id: user.organizacao_id, ordem: count ?? 0 })
    .select('id, descricao, obrigatorio, ordem, ativo')
    .single()

  if (insertError || !data) return err(insertError?.message ?? 'Erro ao criar item', 500)

  return ok(data, 201)
}
