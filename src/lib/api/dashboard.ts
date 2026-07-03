import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthUser } from '@/types/app'

export type Periodo = 'hoje' | 'semana' | 'mes' | 'mes_anterior' | 'personalizado'

function toIso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function rangeForPeriodo(periodo: Periodo): { inicio: string; fim: string } {
  const now = new Date()

  if (periodo === 'hoje') {
    return { inicio: toIso(now), fim: toIso(now) }
  }
  if (periodo === 'semana') {
    const inicio = new Date(now)
    inicio.setDate(now.getDate() - now.getDay())
    return { inicio: toIso(inicio), fim: toIso(now) }
  }
  if (periodo === 'mes_anterior') {
    const inicio = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const fim = new Date(now.getFullYear(), now.getMonth(), 0)
    return { inicio: toIso(inicio), fim: toIso(fim) }
  }
  const inicio = new Date(now.getFullYear(), now.getMonth(), 1)
  return { inicio: toIso(inicio), fim: toIso(now) }
}

function diasEntre(inicio: string, fim: string): number {
  const ms = new Date(fim).getTime() - new Date(inicio).getTime()
  return Math.max(1, Math.round(ms / 86400000) + 1)
}

export function rangeAnterior(inicio: string, fim: string): { inicio: string; fim: string } {
  const dias = diasEntre(inicio, fim)
  const fimAnterior = new Date(inicio)
  fimAnterior.setDate(fimAnterior.getDate() - 1)
  const inicioAnterior = new Date(fimAnterior)
  inicioAnterior.setDate(inicioAnterior.getDate() - (dias - 1))
  return { inicio: toIso(inicioAnterior), fim: toIso(fimAnterior) }
}

interface RankingEntry {
  nome: string
  iql_medio: number
  total: number
}

export interface DashboardData {
  iql_medio: number
  iql_variacao: number | null
  conformidade_epis: number
  total_inspecoes: number
  ncs_abertas: number
  ncs_por_criticidade: { critico: number; alto: number; medio: number; baixo: number }
  ranking_locais: RankingEntry[]
  ranking_zeladores: RankingEntry[]
  ranking_inspetores: RankingEntry[]
  inspecoes_por_dia: { data: string; total: number }[]
  ultimas_inspecoes: {
    id: string
    data: string
    local: string
    zelador: string
    inspetor: string
    iql: number | null
    status: string
  }[]
}

function nomeDe(relacao: unknown): string {
  return (relacao as { nome: string } | null)?.nome ?? '—'
}

function ranking(
  rows: { id: string; indice_qualidade: number | null; chaveId: string; nome: string }[]
): RankingEntry[] {
  const map = new Map<string, { nome: string; soma: number; total: number }>()
  for (const row of rows) {
    const entry = map.get(row.chaveId) ?? { nome: row.nome, soma: 0, total: 0 }
    entry.soma += row.indice_qualidade ?? 0
    entry.total += 1
    map.set(row.chaveId, entry)
  }
  return Array.from(map.values())
    .map((e) => ({ nome: e.nome, iql_medio: Math.round((e.soma / e.total) * 100) / 100, total: e.total }))
    .sort((a, b) => b.iql_medio - a.iql_medio)
}

async function iqlMedioParaRange(
  supabase: SupabaseClient,
  user: AuthUser,
  inicio: string,
  fim: string
): Promise<number | null> {
  const isAdmin = ['admin', 'gestor'].includes(user.role)
  let query = supabase
    .from('inspecoes')
    .select('indice_qualidade')
    .gte('data_inspecao', inicio)
    .lte('data_inspecao', fim)
    .eq('status', 'finalizada')

  if (!isAdmin) query = query.eq('inspetor_id', user.id)

  const { data } = await query
  if (!data || data.length === 0) return null
  const soma = data.reduce((acc, i) => acc + (i.indice_qualidade ?? 0), 0)
  return Math.round((soma / data.length) * 100) / 100
}

export async function getDashboardData(
  supabase: SupabaseClient,
  user: AuthUser,
  periodo: Periodo,
  customRange?: { inicio: string; fim: string }
): Promise<DashboardData> {
  const { inicio, fim } = periodo === 'personalizado' && customRange ? customRange : rangeForPeriodo(periodo)
  const isAdmin = ['admin', 'gestor'].includes(user.role)

  let query = supabase
    .from('inspecoes')
    .select(
      'id, data_inspecao, status, indice_qualidade, indice_seguranca, local_id, zelador_id, inspetor_id, locais(nome), zeladores(nome), usuarios(nome)'
    )
    .gte('data_inspecao', inicio)
    .lte('data_inspecao', fim)
    .neq('status', 'cancelada')

  if (!isAdmin) query = query.eq('inspetor_id', user.id)

  const { data: inspecoesRaw } = await query
  const inspecoes = inspecoesRaw ?? []
  const finalizadas = inspecoes.filter((i) => i.status === 'finalizada')

  const iqlMedio = finalizadas.length
    ? Math.round(
        (finalizadas.reduce((acc, i) => acc + (i.indice_qualidade ?? 0), 0) / finalizadas.length) * 100
      ) / 100
    : 0

  const csMedio = finalizadas.length
    ? Math.round(
        (finalizadas.reduce((acc, i) => acc + (i.indice_seguranca ?? 0), 0) / finalizadas.length) * 100
      ) / 100
    : 0

  let ncQuery = supabase.from('nao_conformidades').select('id, criticidade').eq('status', 'aberta')
  if (!isAdmin) ncQuery = ncQuery.eq('responsavel_id', user.id)
  const { data: ncsAbertasRaw } = await ncQuery
  const ncsAbertas = ncsAbertasRaw ?? []

  const ncsPorCriticidade = {
    critico: ncsAbertas.filter((n) => n.criticidade === 'critico').length,
    alto: ncsAbertas.filter((n) => n.criticidade === 'alto').length,
    medio: ncsAbertas.filter((n) => n.criticidade === 'medio').length,
    baixo: ncsAbertas.filter((n) => n.criticidade === 'baixo').length,
  }

  const rankingLocais = ranking(
    finalizadas.map((i) => ({
      id: i.id,
      indice_qualidade: i.indice_qualidade,
      chaveId: i.local_id,
      nome: nomeDe(i.locais),
    }))
  )

  const rankingZeladores = ranking(
    finalizadas.map((i) => ({
      id: i.id,
      indice_qualidade: i.indice_qualidade,
      chaveId: i.zelador_id,
      nome: nomeDe(i.zeladores),
    }))
  )

  const rankingInspetores = ranking(
    finalizadas.map((i) => ({
      id: i.id,
      indice_qualidade: i.indice_qualidade,
      chaveId: i.inspetor_id,
      nome: nomeDe(i.usuarios),
    }))
  )

  const porDiaMap = new Map<string, number>()
  for (const i of inspecoes) {
    porDiaMap.set(i.data_inspecao, (porDiaMap.get(i.data_inspecao) ?? 0) + 1)
  }
  const inspecoesPorDia = Array.from(porDiaMap.entries())
    .map(([data, total]) => ({ data, total }))
    .sort((a, b) => a.data.localeCompare(b.data))

  const ultimasInspecoes = [...inspecoes]
    .sort((a, b) => b.data_inspecao.localeCompare(a.data_inspecao))
    .slice(0, isAdmin ? 10 : 5)
    .map((i) => ({
      id: i.id,
      data: i.data_inspecao,
      local: nomeDe(i.locais),
      zelador: nomeDe(i.zeladores),
      inspetor: nomeDe(i.usuarios),
      iql: i.indice_qualidade,
      status: i.status,
    }))

  const rangeAnteriorCalc = rangeAnterior(inicio, fim)
  const iqlAnterior = await iqlMedioParaRange(
    supabase,
    user,
    rangeAnteriorCalc.inicio,
    rangeAnteriorCalc.fim
  )
  const iqlVariacao =
    iqlAnterior !== null && finalizadas.length > 0 ? Math.round((iqlMedio - iqlAnterior) * 100) / 100 : null

  return {
    iql_medio: iqlMedio,
    iql_variacao: iqlVariacao,
    conformidade_epis: csMedio,
    total_inspecoes: inspecoes.length,
    ncs_abertas: ncsAbertas.length,
    ncs_por_criticidade: ncsPorCriticidade,
    ranking_locais: rankingLocais,
    ranking_zeladores: rankingZeladores,
    ranking_inspetores: rankingInspetores,
    inspecoes_por_dia: inspecoesPorDia,
    ultimas_inspecoes: ultimasInspecoes,
  }
}
