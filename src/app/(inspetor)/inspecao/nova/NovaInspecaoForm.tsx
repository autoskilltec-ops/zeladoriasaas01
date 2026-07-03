'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { GlassCard } from '@/components/shared/GlassCard'
import { SelectWithAdd } from '@/components/shared/SelectWithAdd'
import { StepIndicator } from '@/components/inspecao/StepIndicator'
import { novaInspecaoSchema, type NovaInspecaoInput } from '@/lib/validations/inspecao'
import { useInspecaoStore } from '@/store/inspecaoStore'
import type { SelectOption } from '@/types/app'
import { cn } from '@/lib/utils'

interface NovaInspecaoFormProps {
  userName: string
  isAdmin: boolean
  locais: SelectOption[]
  zeladores: SelectOption[]
}

export function NovaInspecaoForm({ userName, isAdmin, locais, zeladores }: NovaInspecaoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [localOptions, setLocalOptions] = useState(locais)
  const [zeladorOptions, setZeladorOptions] = useState(zeladores)
  const setInspecaoId = useInspecaoStore((s) => s.setInspecaoId)
  const setDadosVisita = useInspecaoStore((s) => s.setDadosVisita)
  const reset = useInspecaoStore((s) => s.reset)

  const form = useForm<NovaInspecaoInput>({
    resolver: zodResolver(novaInspecaoSchema),
    defaultValues: {
      local_id: '',
      zelador_id: '',
      data_inspecao: new Date().toISOString().slice(0, 10),
      descricao_visita: '',
      limpeza_programada: false,
    },
  })

  async function addLocal(label: string) {
    const res = await fetch('/api/locais', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: label }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error?.message ?? 'Erro ao adicionar local')
      return
    }
    setLocalOptions((prev) => [...prev, { id: json.data.id, label: json.data.nome }])
    form.setValue('local_id', json.data.id)
  }

  async function removeLocal(id: string) {
    const res = await fetch(`/api/locais/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Erro ao remover local')
      return
    }
    setLocalOptions((prev) => prev.filter((o) => o.id !== id))
  }

  async function addZelador(label: string) {
    const res = await fetch('/api/zeladores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: label }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json.error?.message ?? 'Erro ao adicionar zelador')
      return
    }
    setZeladorOptions((prev) => [...prev, { id: json.data.id, label: json.data.nome }])
    form.setValue('zelador_id', json.data.id)
  }

  async function removeZelador(id: string) {
    const res = await fetch(`/api/zeladores/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Erro ao remover zelador')
      return
    }
    setZeladorOptions((prev) => prev.filter((o) => o.id !== id))
  }

  async function onSubmit(values: NovaInspecaoInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/inspecoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao criar inspeção')
        return
      }

      reset()
      setInspecaoId(json.data.inspecao_id)
      setDadosVisita({
        localId: values.local_id,
        zeladorId: values.zelador_id,
        dataInspecao: values.data_inspecao,
      })
      router.push(`/inspecao/${json.data.inspecao_id}/fotos`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StepIndicator current={1} inspecaoId={null} />

      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Nova Inspeção
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Dados da visita
        </p>
      </div>

      <GlassCard>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Data da inspeção *</Label>
            <Input type="date" {...form.register('data_inspecao')} />
            {form.formState.errors.data_inspecao && (
              <p className="text-[12px] text-destructive">
                {form.formState.errors.data_inspecao.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Local *</Label>
            <Controller
              control={form.control}
              name="local_id"
              render={({ field }) => (
                <SelectWithAdd
                  value={field.value}
                  onChange={field.onChange}
                  options={localOptions}
                  placeholder="Selecione o local"
                  isAdmin={isAdmin}
                  onAdd={isAdmin ? addLocal : undefined}
                  onRemove={isAdmin ? removeLocal : undefined}
                />
              )}
            />
            {form.formState.errors.local_id && (
              <p className="text-[12px] text-destructive">Selecione um local</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Responsável pela inspeção</Label>
            <Input value={userName} readOnly disabled />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Zelador responsável *</Label>
            <Controller
              control={form.control}
              name="zelador_id"
              render={({ field }) => (
                <SelectWithAdd
                  value={field.value}
                  onChange={field.onChange}
                  options={zeladorOptions}
                  placeholder="Selecione o zelador"
                  isAdmin={isAdmin}
                  onAdd={isAdmin ? addZelador : undefined}
                  onRemove={isAdmin ? removeZelador : undefined}
                />
              )}
            />
            {form.formState.errors.zelador_id && (
              <p className="text-[12px] text-destructive">Selecione um zelador</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Descrição da visita</Label>
            <Textarea maxLength={500} rows={3} {...form.register('descricao_visita')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Precisa de limpeza programada?</Label>
            <Controller
              control={form.control}
              name="limpeza_programada"
              render={({ field }) => (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(!field.value && 'border-2')}
                    style={!field.value ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)' } : undefined}
                    onClick={() => field.onChange(false)}
                  >
                    Não
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(field.value && 'border-2')}
                    style={field.value ? { borderColor: 'var(--forest-700)', color: 'var(--forest-700)' } : undefined}
                    onClick={() => field.onChange(true)}
                  >
                    Sim
                  </Button>
                </div>
              )}
            />
          </div>

          <Button type="submit" className="btn-primary mt-2" disabled={loading}>
            {loading ? 'Salvando...' : 'Avançar'}
          </Button>
        </form>
      </GlassCard>
    </div>
  )
}
