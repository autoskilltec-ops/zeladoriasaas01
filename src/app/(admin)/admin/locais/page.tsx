import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { LocaisClient } from './LocaisClient'

export const dynamic = 'force-dynamic'

export default async function AdminLocaisPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')
  if (!['admin', 'gestor'].includes(user.role)) redirect('/dashboard')

  const { data: locais } = await supabase
    .from('locais')
    .select('id, nome, tipo, bloco, andar, descricao, ativo')
    .order('nome')

  const ids = (locais ?? []).map((l) => l.id)
  const metricas = new Map<string, { total: number; soma: number }>()

  if (ids.length > 0) {
    const { data: inspecoes } = await supabase
      .from('inspecoes')
      .select('local_id, indice_qualidade')
      .in('local_id', ids)
      .eq('status', 'finalizada')

    for (const i of inspecoes ?? []) {
      const entry = metricas.get(i.local_id) ?? { total: 0, soma: 0 }
      entry.total += 1
      entry.soma += i.indice_qualidade ?? 0
      metricas.set(i.local_id, entry)
    }
  }

  const locaisComMetricas = (locais ?? []).map((l) => {
    const m = metricas.get(l.id)
    return {
      ...l,
      total_inspecoes: m?.total ?? 0,
      iql_medio: m && m.total > 0 ? Math.round((m.soma / m.total) * 100) / 100 : null,
    }
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <LocaisClient locaisIniciais={locaisComMetricas} />
    </div>
  )
}
