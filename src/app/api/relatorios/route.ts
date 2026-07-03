import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { getRelatoriosData } from '@/lib/api/relatorios'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const data = await getRelatoriosData(supabase, user)

  return ok(data)
}
