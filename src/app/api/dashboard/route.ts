import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { getDashboardData, type Periodo } from '@/lib/api/dashboard'

export const dynamic = 'force-dynamic'

const PERIODOS: Periodo[] = ['hoje', 'semana', 'mes', 'mes_anterior', 'ultimos_3_meses']

export async function GET(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { searchParams } = new URL(req.url)
  const periodoParam = searchParams.get('periodo')
  const periodo: Periodo = PERIODOS.includes(periodoParam as Periodo)
    ? (periodoParam as Periodo)
    : 'mes'

  const data = await getDashboardData(supabase, user, periodo)

  return ok(data)
}
