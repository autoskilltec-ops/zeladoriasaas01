import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { ok, err } from '@/lib/api/helpers'
import { cadastroSchema } from '@/lib/validations/auth'
import { slugify } from '@/lib/utils/sanitize'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body) return err('Body inválido', 400)

  const parsed = cadastroSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { nome_organizacao, nome_admin, email, senha } = parsed.data
  const supabaseAdmin = getSupabaseAdmin()

  // 1. Cria usuário no Supabase Auth
  const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  })
  if (authErr || !authUser.user) return err(authErr?.message ?? 'Erro ao criar usuário', 500)

  // 2. Cria organização
  const slug = slugify(nome_organizacao)
  const { data: org, error: orgErr } = await supabaseAdmin
    .from('organizacoes')
    .insert({ nome: nome_organizacao, slug })
    .select('id')
    .single()
  if (orgErr || !org) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    return err('Erro ao criar organização', 500)
  }

  // 3. Cria registro na tabela usuarios com role admin
  const { error: userErr } = await supabaseAdmin
    .from('usuarios')
    .insert({ id: authUser.user.id, organizacao_id: org.id, nome: nome_admin, email, role: 'admin' })
  if (userErr) {
    await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
    await supabaseAdmin.from('organizacoes').delete().eq('id', org.id)
    return err('Erro ao registrar usuário', 500)
  }

  return ok({ organizacao_id: org.id })
}
