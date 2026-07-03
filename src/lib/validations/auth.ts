import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Senha obrigatória'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const cadastroSchema = z.object({
  nome_organizacao: z.string().min(2).max(100),
  nome_admin: z.string().min(2).max(100),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export type CadastroInput = z.infer<typeof cadastroSchema>

export const inspetorSchema = z.object({
  nome: z.string().min(2).max(100),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export type InspetorInput = z.infer<typeof inspetorSchema>
