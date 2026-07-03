export type UserRole = 'admin' | 'gestor' | 'inspetor'
export type InspecaoStatus = 'rascunho' | 'em_andamento' | 'finalizada' | 'cancelada'
export type CriticidadeNivel = 'critico' | 'alto' | 'medio' | 'baixo'
export type NcTipo = 'seguranca' | 'limpeza' | 'epi' | 'estrutural' | 'outro'
export type NcStatus = 'aberta' | 'em_andamento' | 'resolvida' | 'cancelada'
export type EpiStatus = 'sim' | 'parcialmente' | 'nao'
export type ReconhecimentoNivel = 'excelente' | 'bom_exemplo' | 'merece_reconhecimento'

export interface Organizacao {
  id: string
  nome: string
  slug: string
  logo_url: string | null
  ativa: boolean
  meta_qualidade: number
  meta_seguranca: number
  created_at: string
  updated_at: string
}

export interface Usuario {
  id: string
  organizacao_id: string
  nome: string
  email: string
  role: UserRole
  ativo: boolean
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Local {
  id: string
  organizacao_id: string
  nome: string
  descricao: string | null
  tipo: string | null
  bloco: string | null
  andar: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface Zelador {
  id: string
  organizacao_id: string
  nome: string
  matricula: string | null
  setor: string | null
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface CriterioAvaliacao {
  id: string
  organizacao_id: string
  nome: string
  descricao: string | null
  peso: number
  ordem: number
  ativo: boolean
  created_at: string
}

export interface ChecklistSegurancaItem {
  id: string
  organizacao_id: string
  descricao: string
  obrigatorio: boolean
  ordem: number
  ativo: boolean
  created_at: string
}

export interface EpiListaItem {
  id: string
  organizacao_id: string
  nome: string
  obrigatorio: boolean
  ordem: number
  ativo: boolean
  created_at: string
}

export interface Inspecao {
  id: string
  organizacao_id: string
  local_id: string
  inspetor_id: string
  zelador_id: string
  data_inspecao: string
  hora_inicio: string | null
  hora_fim: string | null
  descricao_visita: string | null
  limpeza_programada: boolean
  status: InspecaoStatus
  indice_qualidade: number | null
  indice_seguranca: number | null
  foto_inicial_url: string | null
  foto_final_url: string | null
  finalizada_em: string | null
  created_at: string
  updated_at: string
}

export interface AvaliacaoLimpeza {
  id: string
  inspecao_id: string
  criterio_id: string
  nota: number
  observacao: string | null
  created_at: string
}

export interface SegurancaChecklistResposta {
  id: string
  inspecao_id: string
  item_id: string
  conforme: boolean
  observacao: string | null
  created_at: string
}

export interface EpisInspecao {
  id: string
  inspecao_id: string
  status_geral: EpiStatus
  equipamentos_bons: boolean
  observacoes: string | null
  created_at: string
}

export interface EpiAusente {
  id: string
  epi_inspecao_id: string
  epi_id: string
  created_at: string
}

export interface NaoConformidade {
  id: string
  inspecao_id: string
  organizacao_id: string
  tipo: NcTipo
  descricao: string
  criticidade: CriticidadeNivel
  acao_corretiva: string
  prazo_correcao: string
  responsavel_id: string | null
  status: NcStatus
  resolucao_descricao: string | null
  resolvida_em: string | null
  resolvida_por: string | null
  created_at: string
  updated_at: string
}

export interface Reconhecimento {
  id: string
  inspecao_id: string
  zelador_id: string
  nivel: ReconhecimentoNivel
  descricao: string | null
  publicado_mural: boolean
  created_at: string
}
