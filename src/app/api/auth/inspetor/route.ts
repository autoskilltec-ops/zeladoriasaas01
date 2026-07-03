import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { inspetorSchema } from '@/lib/validations/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // 1. Verifica que quem chama é admin da mesma org
  const { user, error: authErr } = await getAuthUser()
  if (authErr || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const body = await req.json().catch(() => null)
  const parsed = inspetorSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { nome, email, senha } = parsed.data
  const supabaseAdmin = getSupabaseAdmin()

  // 2. Cria no Auth (service_role)
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })
  if (authError || !authUser.user) return err(authError?.message ?? 'Erro ao criar', 500)

  // 3. Registra na tabela com role inspetor e mesma org do admin
  const { error: dbErr } = await supabaseAdmin.from('usuarios').insert({
    id: authUser.user.id,
    organizacao_id: user.organizacao_id,
    nome,
    email,
    role: 'inspetor',
  })
  if (dbErr) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return err('Erro ao registrar inspetor', 500)
  }

  return ok({ id: authUser.user.id, nome, email })
}
