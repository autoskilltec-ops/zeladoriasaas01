import { z } from 'zod'
import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

const locaisPatchSchema = z.object({
  nome: z.string().min(2).max(100).optional(),
  tipo: z.string().max(50).optional(),
  bloco: z.string().max(20).optional(),
  andar: z.string().max(20).optional(),
  descricao: z.string().max(500).optional(),
  ativo: z.boolean().optional(),
})

export async function PATCH(req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const body = await req.json().catch(() => null)
  const parsed = locaisPatchSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { data, error: updateError } = await supabase
    .from('locais')
    .update(parsed.data)
    .eq('id', id)
    .select('id')
    .single()

  if (updateError || !data) return err(updateError?.message ?? 'Erro ao atualizar', 500)

  return ok(data)
}

export async function DELETE(req: Request, { params }: RouteContext) {
  const { id } = await params
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const permanente = new URL(req.url).searchParams.get('permanente') === 'true'

  if (permanente) {
    const { error: deleteError } = await supabase.from('locais').delete().eq('id', id)
    if (deleteError) {
      if (deleteError.code === '23503') {
        return err('Não é possível excluir: existem inspeções vinculadas a este local. Desative-o em vez disso.', 409)
      }
      return err(deleteError.message, 500)
    }
    return ok({ id })
  }

  const { error: updateError } = await supabase.from('locais').update({ ativo: false }).eq('id', id)

  if (updateError) return err(updateError.message, 500)

  return ok({ id })
}
