'use client'

import { useMemo, useState } from 'react'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { SelectOption } from '@/types/app'

interface SelectWithAddProps {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  onAdd?: (label: string) => Promise<void>
  onRemove?: (id: string) => Promise<void>
  placeholder?: string
  isAdmin?: boolean
  disabled?: boolean
}

export function SelectWithAdd({
  value,
  onChange,
  options,
  onAdd,
  onRemove,
  placeholder = 'Selecione...',
  isAdmin = false,
  disabled = false,
}: SelectWithAddProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  )
  const selected = options.find((o) => o.id === value)

  async function handleAdd() {
    const label = newLabel.trim()
    if (!label || !onAdd) return
    setBusy(true)
    try {
      await onAdd(label)
      setNewLabel('')
      setAdding(false)
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(id: string) {
    if (!onRemove) return
    setBusy(true)
    try {
      await onRemove(id)
      setConfirmRemoveId(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className="w-full min-h-10 justify-between font-normal"
          >
            <span className={cn('truncate', !selected && 'text-muted-foreground')}>
              {selected ? selected.label : placeholder}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-(--anchor-width) p-0">
        <div className="p-2 border-b border-border">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-56 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <p className="px-2 py-3 text-sm text-muted-foreground text-center">
              Nenhum resultado
            </p>
          )}
          {filtered.map((option) => (
            <div
              key={option.id}
              className="group flex items-center gap-1 rounded-md hover:bg-accent"
            >
              <button
                type="button"
                onClick={() => {
                  onChange(option.id)
                  setOpen(false)
                }}
                className="flex flex-1 items-center gap-2 px-2 py-1.5 text-sm text-left"
              >
                <Check
                  className={cn('size-4', option.id === value ? 'opacity-100' : 'opacity-0')}
                />
                <span className="truncate">{option.label}</span>
              </button>
              {isAdmin && onRemove && (
                <>
                  {confirmRemoveId === option.id ? (
                    <div className="flex items-center gap-1 pr-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        className="h-6 px-2 text-xs"
                        disabled={busy}
                        onClick={() => handleRemove(option.id)}
                      >
                        Remover
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        disabled={busy}
                        onClick={() => setConfirmRemoveId(null)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmRemoveId(option.id)}
                      className="pr-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      aria-label={`Remover ${option.label}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        {isAdmin && onAdd && (
          <div className="border-t border-border p-2">
            {adding ? (
              <div className="flex items-center gap-1">
                <Input
                  autoFocus
                  placeholder="Novo item..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAdd()
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-8"
                  disabled={busy || !newLabel.trim()}
                  onClick={handleAdd}
                >
                  OK
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex w-full items-center gap-1.5 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <Plus className="size-4" />
                Adicionar novo
              </button>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
