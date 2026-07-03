import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { ZeladoresClient } from './ZeladoresClient'

export const dynamic = 'force-dynamic'

export default async function AdminZeladoresPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')
  if (!['admin', 'gestor'].includes(user.role)) redirect('/dashboard')

  const { data: zeladores } = await supabase
    .from('zeladores')
    .select('id, nome, matricula, setor, ativo')
    .order('nome')

  const ids = (zeladores ?? []).map((z) => z.id)
  const metricas = new Map<string, { total: number; soma: number }>()

  if (ids.length > 0) {
    const { data: inspecoes } = await supabase
      .from('inspecoes')
      .select('zelador_id, indice_qualidade')
      .in('zelador_id', ids)
      .eq('status', 'finalizada')

    for (const i of inspecoes ?? []) {
      const entry = metricas.get(i.zelador_id) ?? { total: 0, soma: 0 }
      entry.total += 1
      entry.soma += i.indice_qualidade ?? 0
      metricas.set(i.zelador_id, entry)
    }
  }

  const zeladoresComMetricas = (zeladores ?? []).map((z) => {
    const m = metricas.get(z.id)
    return {
      ...z,
      total_avaliacoes: m?.total ?? 0,
      avaliacao_media: m && m.total > 0 ? Math.round((m.soma / m.total) * 100) / 100 : null,
    }
  })

  const { data: reconhecimentos } = await supabase
    .from('reconhecimentos')
    .select('id, nivel, descricao, created_at, zeladores(nome)')
    .order('created_at', { ascending: false })
    .limit(10)

  const mural = (reconhecimentos ?? []).map((r) => ({
    id: r.id,
    nivel: r.nivel,
    descricao: r.descricao,
    created_at: r.created_at,
    zelador: (r.zeladores as unknown as { nome: string } | null)?.nome ?? '—',
  }))

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <ZeladoresClient zeladoresIniciais={zeladoresComMetricas} mural={mural} />
    </div>
  )
}
