import { ok, err, getAuthUser } from '@/lib/api/helpers'
import { novaInspecaoSchema } from '@/lib/validations/inspecao'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const localId = searchParams.get('local_id')
  const inspetorId = searchParams.get('inspetor_id')
  const zeladorId = searchParams.get('zelador_id')
  const dataInicio = searchParams.get('data_inicio')
  const dataFim = searchParams.get('data_fim')
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')))
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('inspecoes')
    .select(
      'id, data_inspecao, status, indice_qualidade, indice_seguranca, local:locais(nome), zelador:zeladores(nome), inspetor:usuarios(nome)',
      { count: 'exact' }
    )
    .order('data_inspecao', { ascending: false })
    .range(from, to)

  if (status) query = query.eq('status', status)
  if (localId) query = query.eq('local_id', localId)
  if (inspetorId) query = query.eq('inspetor_id', inspetorId)
  if (zeladorId) query = query.eq('zelador_id', zeladorId)
  if (dataInicio) query = query.gte('data_inspecao', dataInicio)
  if (dataFim) query = query.lte('data_inspecao', dataFim)

  const { data, count, error: queryError } = await query
  if (queryError) return err(queryError.message, 500)

  return ok({ inspecoes: data, total: count ?? 0, page, limit })
}

export async function POST(req: Request) {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)

  const body = await req.json().catch(() => null)
  if (!body) return err('Body inválido', 400)

  const parsed = novaInspecaoSchema.safeParse(body)
  if (!parsed.success) return err(parsed.error.issues[0]?.message ?? 'Dados inválidos', 422)

  const { data, error: insertError } = await supabase
    .from('inspecoes')
    .insert({
      ...parsed.data,
      organizacao_id: user.organizacao_id,
      inspetor_id: user.id,
    })
    .select('id')
    .single()

  if (insertError || !data) return err(insertError?.message ?? 'Erro ao criar inspeção', 500)

  return ok({ inspecao_id: data.id }, 201)
}
