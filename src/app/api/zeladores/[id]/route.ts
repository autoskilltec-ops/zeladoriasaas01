import { z } from 'zod'
import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

const zeladoresPatchSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  matricula: z.string().max(20).optional(),
  setor: z.string().max(50).optional(),
  ativo: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const body = await req.json().catch(() => null)
  const parsed = zeladoresPatchSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { data, error: updateError } = await supabase
    .from('zeladores')
    .update(parsed.data)
    .eq('id', id)
    .select('id')
    .single()

  if (updateError || !data) return err(updateError?.message ?? 'Erro ao atualizar', 500)

  return ok(data)
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const { error: updateError } = await supabase
    .from('zeladores')
    .update({ ativo: false })
    .eq('id', id)

  if (updateError) return err(updateError.message, 500)

  return ok({ id })
}
