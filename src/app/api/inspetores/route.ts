import { ok, err, getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) return err('Não autorizado', 401)
  if (!['admin', 'gestor'].includes(user.role)) return err('Sem permissão', 403)

  const { data: inspetores, error: queryError } = await supabase
    .from('usuarios')
    .select('id, nome, email, ativo')
    .eq('role', 'inspetor')
    .order('nome')

  if (queryError) return err(queryError.message, 500)

  const ids = (inspetores ?? []).map((i) => i.id)
  const metricas = new Map<string, { total: number; soma: number; ultima: string | null }>()

  if (ids.length > 0) {
    const { data: inspecoes } = await supabase
      .from('inspecoes')
      .select('inspetor_id, indice_qualidade, data_inspecao')
      .in('inspetor_id', ids)
      .eq('status', 'finalizada')

    for (const i of inspecoes ?? []) {
      const entry = metricas.get(i.inspetor_id) ?? { total: 0, soma: 0, ultima: null as string | null }
      entry.total += 1
      entry.soma += i.indice_qualidade ?? 0
      if (!entry.ultima || i.data_inspecao > entry.ultima) entry.ultima = i.data_inspecao
      metricas.set(i.inspetor_id, entry)
    }
  }

  const result = (inspetores ?? []).map((i) => {
    const m = metricas.get(i.id)
    return {
      id: i.id,
      nome: i.nome,
      email: i.email,
      ativo: i.ativo,
      total_inspecoes: m?.total ?? 0,
      iql_medio: m && m.total > 0 ? Math.round((m.soma / m.total) * 100) / 100 : null,
      ultima_inspecao: m?.ultima ?? null,
    }
  })

  return ok(result)
}
