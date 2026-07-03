'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { corCriticidade } from '@/lib/utils/calculos'
import { formatCriticidade, formatNcTipo } from '@/lib/utils/formatters'
import type { SelectOption } from '@/types/app'

const ncFormSchema = z.object({
  tipo: z.enum(['seguranca', 'limpeza', 'epi', 'estrutural', 'outro']),
  descricao: z.string().min(5, 'Mínimo de 5 caracteres').max(1000),
  criticidade: z.enum(['critico', 'alto', 'medio', 'baixo']),
  acao_corretiva: z.string().min(5, 'Mínimo de 5 caracteres').max(1000),
  prazo_correcao: z.string().min(1, 'Informe o prazo'),
  responsavel_id: z.string().optional(),
})

export type NcFormValues = z.infer<typeof ncFormSchema>

const TIPOS = ['seguranca', 'limpeza', 'epi', 'estrutural', 'outro'] as const
const CRITICIDADES = ['critico', 'alto', 'medio', 'baixo'] as const

interface NcFormProps {
  responsaveis: SelectOption[]
  onAdd: (values: NcFormValues) => Promise<void>
  saving?: boolean
}

export function NcForm({ responsaveis, onAdd, saving }: NcFormProps) {
  const form = useForm<NcFormValues>({
    resolver: zodResolver(ncFormSchema),
    defaultValues: {
      tipo: 'limpeza',
      descricao: '',
      criticidade: 'medio',
      acao_corretiva: '',
      prazo_correcao: '',
      responsavel_id: undefined,
    },
  })

  async function onSubmit(values: NcFormValues) {
    await onAdd(values)
    form.reset()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Tipo *</Label>
        <Controller
          control={form.control}
          name="tipo"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {formatNcTipo(tipo)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Descrição *</Label>
        <Textarea rows={3} {...form.register('descricao')} />
        {form.formState.errors.descricao && (
          <p className="text-[12px] text-destructive">{form.formState.errors.descricao.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Criticidade *</Label>
        <Controller
          control={form.control}
          name="criticidade"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {CRITICIDADES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => field.onChange(c)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors',
                    field.value === c ? 'text-white' : 'text-[var(--text-secondary)]'
                  )}
                  style={{
                    background: field.value === c ? corCriticidade(c) : '#f0f2f1',
                  }}
                >
                  {formatCriticidade(c)}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Ação corretiva *</Label>
        <Textarea rows={3} {...form.register('acao_corretiva')} />
        {form.formState.errors.acao_corretiva && (
          <p className="text-[12px] text-destructive">
            {form.formState.errors.acao_corretiva.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Prazo *</Label>
        <Input type="date" {...form.register('prazo_correcao')} />
        {form.formState.errors.prazo_correcao && (
          <p className="text-[12px] text-destructive">
            {form.formState.errors.prazo_correcao.message}
          </p>
        )}
      </div>

      {responsaveis.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <Label>Responsável</Label>
          <Controller
            control={form.control}
            name="responsavel_id"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      )}

      <Button type="submit" className="btn-primary" disabled={saving}>
        {saving ? 'Adicionando...' : '+ Adicionar outra NC'}
      </Button>
    </form>
  )
}
