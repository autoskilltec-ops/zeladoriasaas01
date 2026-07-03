import { z } from 'zod'

export const uuidSchema = z.string().uuid()

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')

export const criticidadeSchema = z.enum(['critico', 'alto', 'medio', 'baixo'])
