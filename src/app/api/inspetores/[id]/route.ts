import { z } from 'zod'
import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

const schema = z.object({ ativo: z.boolean() })

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return err('Dados inválidos', 422)

  const { error: updateError } = await supabase
    .from('usuarios')
    .update({ ativo: parsed.data.ativo })
    .eq('id', id)
    .eq('role', 'inspetor')

  if (updateError) return err(updateError.message, 500)

  return ok({ id })
}
