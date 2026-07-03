'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/GlassCard'
import { ConfigList, type ConfigItem } from '@/components/admin/ConfigList'

interface Organizacao {
  id: string
  nome: string
  logo_url: string | null
  meta_qualidade: number
  meta_seguranca: number
}

interface ConfiguracoesClientProps {
  criteriosIniciais: ConfigItem[]
  checklistIniciais: ConfigItem[]
  episIniciais: ConfigItem[]
  organizacaoInicial: Organizacao
}

function createHandlers(
  apiBase: string,
  labelField: 'nome' | 'descricao',
  items: ConfigItem[],
  setItems: React.Dispatch<React.SetStateAction<ConfigItem[]>>
) {
  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch(`${apiBase}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) toast.error('Erro ao salvar alteração')
    return res.ok
  }

  return {
    onAdd: async (label: string, extra: { peso?: number; obrigatorio?: boolean }) => {
      const body: Record<string, unknown> = { [labelField]: label }
      if (extra.peso !== undefined) body.peso = extra.peso
      if (extra.obrigatorio !== undefined) body.obrigatorio = extra.obrigatorio

      const res = await fetch(apiBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao adicionar item')
        return
      }
      setItems((prev) => [
        ...prev,
        {
          id: json.data.id,
          label: json.data[labelField],
          ordem: json.data.ordem,
          ativo: true,
          peso: json.data.peso,
          obrigatorio: json.data.obrigatorio,
        },
      ])
    },
    onUpdateLabel: async (id: string, label: string) => {
      if (!(await patch(id, { [labelField]: label }))) return
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)))
    },
    onUpdatePeso: async (id: string, peso: number) => {
      if (!(await patch(id, { peso }))) return
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, peso } : i)))
    },
    onToggleObrigatorio: async (id: string, obrigatorio: boolean) => {
      if (!(await patch(id, { obrigatorio }))) return
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, obrigatorio } : i)))
    },
    onReorder: async (id: string, direction: 'up' | 'down') => {
      const ordenados = [...items].sort((a, b) => a.ordem - b.ordem)
      const idx = ordenados.findIndex((i) => i.id === id)
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= ordenados.length) return
      const a = ordenados[idx]
      const b = ordenados[swapIdx]

      const [okA, okB] = await Promise.all([
        patch(a.id, { ordem: b.ordem }),
        patch(b.id, { ordem: a.ordem }),
      ])
      if (!okA || !okB) return

      setItems((prev) =>
        prev.map((i) => {
          if (i.id === a.id) return { ...i, ordem: b.ordem }
          if (i.id === b.id) return { ...i, ordem: a.ordem }
          return i
        })
      )
    },
    onDelete: async (id: string) => {
      const res = await fetch(`${apiBase}/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('Erro ao remover item')
        return
      }
      setItems((prev) => prev.filter((i) => i.id !== id))
    },
  }
}

export function ConfiguracoesClient({
  criteriosIniciais,
  checklistIniciais,
  episIniciais,
  organizacaoInicial,
}: ConfiguracoesClientProps) {
  const [criterios, setCriterios] = useState<ConfigItem[]>(criteriosIniciais)
  const [checklist, setChecklist] = useState<ConfigItem[]>(checklistIniciais)
  const [epis, setEpis] = useState<ConfigItem[]>(episIniciais)
  const [org, setOrg] = useState(organizacaoInicial)
  const [savingMetas, setSavingMetas] = useState(false)
  const [savingOrg, setSavingOrg] = useState(false)

  const criteriosHandlers = createHandlers('/api/criterios', 'nome', criterios, setCriterios)
  const checklistHandlers = createHandlers('/api/checklist-seguranca', 'descricao', checklist, setChecklist)
  const episHandlers = createHandlers('/api/epis', 'nome', epis, setEpis)

  async function salvarMetas() {
    setSavingMetas(true)
    try {
      const res = await fetch('/api/organizacao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_qualidade: org.meta_qualidade,
          meta_seguranca: org.meta_seguranca,
        }),
      })
      if (!res.ok) {
        toast.error('Erro ao salvar metas')
        return
      }
      toast.success('Metas atualizadas')
    } finally {
      setSavingMetas(false)
    }
  }

  async function salvarOrg() {
    setSavingOrg(true)
    try {
      const res = await fetch('/api/organizacao', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: org.nome, logo_url: org.logo_url ?? '' }),
      })
      if (!res.ok) {
        toast.error('Erro ao salvar organização')
        return
      }
      toast.success('Organização atualizada')
    } finally {
      setSavingOrg(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Configurações
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Personalize os critérios, checklists e dados da organização
        </p>
      </div>

      <ConfigList
        title="Critérios de avaliação"
        items={criterios}
        showPeso
        labelPlaceholder="Novo critério..."
        {...criteriosHandlers}
      />

      <ConfigList
        title="Checklist de segurança"
        items={checklist}
        showObrigatorio
        labelPlaceholder="Novo item de checklist..."
        {...checklistHandlers}
      />

      <ConfigList
        title="Lista de EPIs"
        items={epis}
        showObrigatorio
        labelPlaceholder="Novo EPI..."
        {...episHandlers}
      />

      <GlassCard className="flex flex-col gap-4">
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Metas da organização
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Meta de IQL (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={org.meta_qualidade}
              onChange={(e) => setOrg((prev) => ({ ...prev, meta_qualidade: Number(e.target.value) }))}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Meta de Conformidade EPIs (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={org.meta_seguranca}
              onChange={(e) => setOrg((prev) => ({ ...prev, meta_seguranca: Number(e.target.value) }))}
            />
          </div>
        </div>
        <Button type="button" className="btn-primary self-start" onClick={salvarMetas} disabled={savingMetas}>
          {savingMetas ? 'Salvando...' : 'Salvar metas'}
        </Button>
      </GlassCard>

      <GlassCard className="flex flex-col gap-4">
        <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Dados da organização
        </p>
        <div className="flex flex-col gap-1.5">
          <Label>Nome da organização</Label>
          <Input value={org.nome} onChange={(e) => setOrg((prev) => ({ ...prev, nome: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>URL do logo</Label>
          <Input
            placeholder="https://..."
            value={org.logo_url ?? ''}
            onChange={(e) => setOrg((prev) => ({ ...prev, logo_url: e.target.value }))}
          />
        </div>
        <Button type="button" className="btn-primary self-start" onClick={salvarOrg} disabled={savingOrg}>
          {savingOrg ? 'Salvando...' : 'Salvar organização'}
        </Button>
      </GlassCard>
    </div>
  )
}
