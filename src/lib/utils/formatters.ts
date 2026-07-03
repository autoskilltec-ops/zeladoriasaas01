export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const [ano, mes, dia] = iso.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  const data = date.toLocaleDateString('pt-BR')
  const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${data} ${hora}`
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${value.toFixed(0)}%`
}

const CRITICIDADE_LABELS: Record<string, string> = {
  critico: 'Crítico',
  alto: 'Alto',
  medio: 'Médio',
  baixo: 'Baixo',
}

export function formatCriticidade(criticidade: string): string {
  return CRITICIDADE_LABELS[criticidade] ?? criticidade
}

const NC_TIPO_LABELS: Record<string, string> = {
  seguranca: 'Segurança',
  limpeza: 'Limpeza',
  epi: 'EPI',
  estrutural: 'Estrutural',
  outro: 'Outro',
}

export function formatNcTipo(tipo: string): string {
  return NC_TIPO_LABELS[tipo] ?? tipo
}

const STATUS_LABELS: Record<string, string> = {
  rascunho: 'Rascunho',
  em_andamento: 'Em andamento',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
}

export function formatStatus(status: string): string {
  return STATUS_LABELS[status] ?? status
}
