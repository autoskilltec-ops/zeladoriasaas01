'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/shared/GlassCard'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { cn } from '@/lib/utils'

export interface ConfigItem {
  id: string
  label: string
  ordem: number
  ativo: boolean
  peso?: number
  obrigatorio?: boolean
}

interface ConfigListProps {
  title: string
  items: ConfigItem[]
  showPeso?: boolean
  showObrigatorio?: boolean
  labelPlaceholder?: string
  onAdd: (label: string, extra: { peso?: number; obrigatorio?: boolean }) => Promise<void>
  onUpdateLabel: (id: string, label: string) => Promise<void>
  onUpdatePeso?: (id: string, peso: number) => Promise<void>
  onToggleObrigatorio?: (id: string, obrigatorio: boolean) => Promise<void>
  onReorder: (id: string, direction: 'up' | 'down') => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ConfigList({
  title,
  items,
  showPeso,
  showObrigatorio,
  labelPlaceholder = 'Novo item...',
  onAdd,
  onUpdateLabel,
  onUpdatePeso,
  onToggleObrigatorio,
  onReorder,
  onDelete,
}: ConfigListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const [novoLabel, setNovoLabel] = useState('')
  const [novoPeso, setNovoPeso] = useState('1')
  const [novoObrigatorio, setNovoObrigatorio] = useState(true)
  const [confirmarRemocao, setConfirmarRemocao] = useState<ConfigItem | null>(null)
  const [busy, setBusy] = useState(false)

  const ordenados = [...items].sort((a, b) => a.ordem - b.ordem)

  function iniciarEdicao(item: ConfigItem) {
    setEditingId(item.id)
    setEditingLabel(item.label)
  }

  async function salvarEdicao() {
    if (!editingId) return
    await onUpdateLabel(editingId, editingLabel)
    setEditingId(null)
  }

  async function adicionar() {
    if (!novoLabel.trim() || busy) return
    setBusy(true)
    try {
      await onAdd(novoLabel.trim(), {
        peso: showPeso ? Number(novoPeso) || 1 : undefined,
        obrigatorio: showObrigatorio ? novoObrigatorio : undefined,
      })
      setNovoLabel('')
      setNovoPeso('1')
      setNovoObrigatorio(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <GlassCard>
      <p className="mb-3 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {title}
      </p>

      <div className="flex flex-col divide-y divide-[#dce3de]">
        {ordenados.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2 py-2">
            <div className="flex flex-col">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onReorder(item.id, 'up')}
                className="disabled:opacity-20"
              >
                <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
              <button
                type="button"
                disabled={index === ordenados.length - 1}
                onClick={() => onReorder(item.id, 'down')}
                className="disabled:opacity-20"
              >
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {editingId === item.id ? (
              <Input
                autoFocus
                value={editingLabel}
                onChange={(e) => setEditingLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && salvarEdicao()}
                onBlur={salvarEdicao}
                className="h-8 flex-1"
              />
            ) : (
              <button
                type="button"
                onClick={() => iniciarEdicao(item)}
                className="flex-1 text-left text-[13px]"
                style={{ color: 'var(--text-primary)' }}
              >
                {item.label}
              </button>
            )}

            {showPeso && (
              <Input
                type="number"
                step="0.1"
                min="0.1"
                defaultValue={item.peso}
                onBlur={(e) => {
                  const valor = Number(e.target.value)
                  if (valor > 0 && valor !== item.peso) onUpdatePeso?.(item.id, valor)
                }}
                className="h-7 w-16 text-right"
                aria-label={`Peso de ${item.label}`}
              />
            )}

            {showObrigatorio && (
              <button
                type="button"
                onClick={() => onToggleObrigatorio?.(item.id, !item.obrigatorio)}
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-medium',
                  item.obrigatorio ? 'text-white' : ''
                )}
                style={{
                  background: item.obrigatorio ? 'var(--forest-600)' : '#f0f2f1',
                  color: item.obrigatorio ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {item.obrigatorio ? 'Obrigatório' : 'Opcional'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setConfirmarRemocao(item)}
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remover ${item.label}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
        {ordenados.length === 0 && (
          <p className="py-2 text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Nenhum item cadastrado.
          </p>
        )}
      </div>

      <div className="mt-3 flex items-end gap-2 border-t pt-3" style={{ borderColor: '#dce3de' }}>
        <Input
          placeholder={labelPlaceholder}
          value={novoLabel}
          disabled={busy}
          onChange={(e) => setNovoLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && adicionar()}
          className="h-8 flex-1"
        />
        {showPeso && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
              Peso
            </label>
            <Input
              type="number"
              step="0.1"
              min="0.1"
              value={novoPeso}
              onChange={(e) => setNovoPeso(e.target.value)}
              className="h-8 w-16"
            />
          </div>
        )}
        {showObrigatorio && (
          <button
            type="button"
            onClick={() => setNovoObrigatorio((v) => !v)}
            className="rounded-full px-2 py-1 text-[11px] font-medium"
            style={{
              background: novoObrigatorio ? 'var(--forest-600)' : '#f0f2f1',
              color: novoObrigatorio ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {novoObrigatorio ? 'Obrigatório' : 'Opcional'}
          </button>
        )}
        <Button type="button" size="sm" disabled={busy || !novoLabel.trim()} onClick={adicionar}>
          <Plus size={14} />
        </Button>
      </div>

      <ConfirmDialog
        open={!!confirmarRemocao}
        onOpenChange={(v) => !v && setConfirmarRemocao(null)}
        title={`Remover "${confirmarRemocao?.label}"?`}
        confirmLabel="Remover"
        destructive
        onConfirm={async () => {
          if (confirmarRemocao) await onDelete(confirmarRemocao.id)
          setConfirmarRemocao(null)
        }}
      />
    </GlassCard>
  )
}
