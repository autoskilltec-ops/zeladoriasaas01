import { z } from 'zod'
import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

const schema = z.object({
  nome: z.string().min(2).max(100).optional(),
  logo_url: z.string().url().or(z.literal('')).optional(),
  meta_qualidade: z.number().min(0).max(100).optional(),
  meta_seguranca: z.number().min(0).max(100).optional(),
})

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { data, error: queryError } = await supabase
    .from('organizacoes')
    .select('id, nome, logo_url, meta_qualidade, meta_seguranca')
    .eq('id', user.organizacao_id)
    .single()

  if (queryError || !data) return err('Organização não encontrada', 404)

  return ok(data)
}

export async function PATCH(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const updates: Record<string, unknown> = { ...parsed.data }
  if (updates.logo_url === '') updates.logo_url = null

  const { data, error: updateError } = await supabase
    .from('organizacoes')
    .update(updates)
    .eq('id', user.organizacao_id)
    .select('id')
    .single()

  if (updateError || !data) return err(updateError?.message ?? 'Erro ao atualizar', 500)

  return ok(data)
}
