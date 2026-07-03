import { z } from 'zod'
import { dateSchema, criticidadeSchema, uuidSchema } from './shared'

export const novaInspecaoSchema = z.object({
  local_id: uuidSchema,
  zelador_id: uuidSchema,
  data_inspecao: dateSchema,
  descricao_visita: z.string().max(500).optional(),
  limpeza_programada: z.boolean(),
})

export type NovaInspecaoInput = z.infer<typeof novaInspecaoSchema>

export const patchInspecaoSchema = novaInspecaoSchema.partial()

export const avaliacoesSchema = z.object({
  inspecao_id: uuidSchema,
  avaliacoes: z
    .array(
      z.object({
        criterio_id: uuidSchema,
        nota: z.number().int().min(1).max(5),
      })
    )
    .min(1),
})

export type AvaliacoesInput = z.infer<typeof avaliacoesSchema>

export const segurancaSchema = z.object({
  inspecao_id: uuidSchema,
  respostas: z.array(
    z.object({
      item_id: uuidSchema,
      conforme: z.boolean(),
    })
  ),
  status_geral_epi: z.enum(['sim', 'parcialmente', 'nao']),
  epis_ausentes: z.array(uuidSchema).optional(),
  equipamentos_bons: z.boolean(),
  observacoes: z.string().max(500).optional(),
})

export type SegurancaInput = z.infer<typeof segurancaSchema>

export const naoConformidadeSchema = z.object({
  inspecao_id: uuidSchema,
  tipo: z.enum(['seguranca', 'limpeza', 'epi', 'estrutural', 'outro']),
  descricao: z.string().min(5).max(1000),
  criticidade: criticidadeSchema,
  acao_corretiva: z.string().min(5).max(1000),
  prazo_correcao: dateSchema,
  responsavel_id: uuidSchema.optional(),
})

export type NaoConformidadeInput = z.infer<typeof naoConformidadeSchema>

export const reconhecimentoSchema = z.object({
  inspecao_id: uuidSchema,
  zelador_id: uuidSchema,
  nivel: z.enum(['excelente', 'bom_exemplo', 'merece_reconhecimento']),
  descricao: z.string().max(500).optional(),
})

export type ReconhecimentoInput = z.infer<typeof reconhecimentoSchema>
