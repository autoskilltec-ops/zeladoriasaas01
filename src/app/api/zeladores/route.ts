import { z } from 'zod'
import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

const zeladoresSchema = z.object({
  nome: z.string().min(2).max(100),
  matricula: z.string().max(20).optional(),
  setor: z.string().max(50).optional(),
})

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { data, error: queryError } = await supabase
    .from('zeladores')
    .select('id, nome, matricula, setor, ativo')
    .eq('ativo', true)
    .order('nome')

  if (queryError) return err(queryError.message, 500)

  return ok(data)
}

export async function POST(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const body = await req.json().catch(() => null)
  const parsed = zeladoresSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { data, error: insertError } = await supabase
    .from('zeladores')
    .insert({ ...parsed.data, organizacao_id: user.organizacao_id })
    .select('id, nome')
    .single()

  if (insertError || !data) return err(insertError?.message ?? 'Erro ao criar zelador', 500)

  return ok(data, 201)
}
