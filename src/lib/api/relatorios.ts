import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthUser } from '@/types/app'

const MESES = 6

function nomeDe(relacao: unknown): string {
  return (relacao as { nome: string } | null)?.nome ?? '—'
}

export interface RelatoriosData {
  iql_por_mes: { mes: string; iql_medio: number }[]
  total_por_mes: { mes: string; total: number }[]
  ranking_locais: { nome: string; iql_medio: number; total: number }[]
  ncs_por_criticidade: { critico: number; alto: number; medio: number; baixo: number }
  desempenho_por_criterio: { criterio: string; nota_media: number }[]
}

export async function getRelatoriosData(
  supabase: SupabaseClient,
  user: AuthUser
): Promise<RelatoriosData> {
  const isAdmin = ['admin', 'gestor'].includes(user.role)

  const now = new Date()
  const inicio = new Date(now.getFullYear(), now.getMonth() - (MESES - 1), 1)
  const inicioIso = inicio.toISOString().slice(0, 10)

  let query = supabase
    .from('inspecoes')
    .select('id, data_inspecao, indice_qualidade, local_id, locais(nome)')
    .gte('data_inspecao', inicioIso)
    .eq('status', 'finalizada')

  if (!isAdmin) query = query.eq('inspetor_id', user.id)

  const { data: inspecoesRaw } = await query
  const inspecoes = inspecoesRaw ?? []

  const porMes = new Map<string, { soma: number; total: number }>()
  for (const i of inspecoes) {
    const mes = i.data_inspecao.slice(0, 7)
    const entry = porMes.get(mes) ?? { soma: 0, total: 0 }
    entry.soma += i.indice_qualidade ?? 0
    entry.total += 1
    porMes.set(mes, entry)
  }
  const mesesOrdenados = Array.from(porMes.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  const iqlPorMes = mesesOrdenados.map(([mes, v]) => ({
    mes,
    iql_medio: v.total ? Math.round((v.soma / v.total) * 100) / 100 : 0,
  }))
  const totalPorMes = mesesOrdenados.map(([mes, v]) => ({ mes, total: v.total }))

  const localMap = new Map<string, { nome: string; soma: number; total: number }>()
  for (const i of inspecoes) {
    const nome = nomeDe(i.locais)
    const entry = localMap.get(i.local_id) ?? { nome, soma: 0, total: 0 }
    entry.soma += i.indice_qualidade ?? 0
    entry.total += 1
    localMap.set(i.local_id, entry)
  }
  const rankingLocais = Array.from(localMap.values())
    .map((l) => ({ nome: l.nome, iql_medio: Math.round((l.soma / l.total) * 100) / 100, total: l.total }))
    .sort((a, b) => b.total - a.total)

  const inspecaoIds = inspecoes.map((i) => i.id)

  const ncsPorCriticidade = { critico: 0, alto: 0, medio: 0, baixo: 0 }
  const desempenhoPorCriterio: { criterio: string; nota_media: number }[] = []

  if (inspecaoIds.length > 0) {
    // Consultas independentes entre si — rodam em paralelo em vez de em série.
    const [{ data: ncs }, { data: avaliacoes }] = await Promise.all([
      supabase.from('nao_conformidades').select('criticidade').in('inspecao_id', inspecaoIds),
      supabase
        .from('avaliacoes_limpeza')
        .select('nota, criterios_avaliacao(nome)')
        .in('inspecao_id', inspecaoIds),
    ])

    for (const nc of ncs ?? []) {
      const chave = nc.criticidade as keyof typeof ncsPorCriticidade
      if (chave in ncsPorCriticidade) ncsPorCriticidade[chave] += 1
    }

    const criterioMap = new Map<string, { soma: number; total: number }>()
    for (const a of avaliacoes ?? []) {
      const nome = nomeDe(a.criterios_avaliacao)
      const entry = criterioMap.get(nome) ?? { soma: 0, total: 0 }
      entry.soma += a.nota
      entry.total += 1
      criterioMap.set(nome, entry)
    }
    for (const [criterio, v] of criterioMap.entries()) {
      desempenhoPorCriterio.push({ criterio, nota_media: Math.round((v.soma / v.total) * 100) / 100 })
    }
  }

  return {
    iql_por_mes: iqlPorMes,
    total_por_mes: totalPorMes,
    ranking_locais: rankingLocais,
    ncs_por_criticidade: ncsPorCriticidade,
    desempenho_por_criterio: desempenhoPorCriterio,
  }
}
