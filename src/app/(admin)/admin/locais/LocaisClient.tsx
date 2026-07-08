'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/shared/GlassCard'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDate, formatPercent, formatStatus } from '@/lib/utils/formatters'

interface Local {
  id: string
  nome: string
  tipo: string | null
  bloco: string | null
  andar: string | null
  descricao: string | null
  ativo: boolean
  total_inspecoes: number
  iql_medio: number | null
}

interface HistoricoItem {
  id: string
  data_inspecao: string
  status: string
  indice_qualidade: number | null
  zelador: { nome: string } | null
}

interface FormValues {
  nome: string
  tipo: string
  bloco: string
  andar: string
  descricao: string
}

export function LocaisClient({ locaisIniciais }: { locaisIniciais: Local[] }) {
  const [locais, setLocais] = useState<Local[]>(locaisIniciais)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selecionado, setSelecionado] = useState<Local | null>(null)
  const [historico, setHistorico] = useState<HistoricoItem[]>([])
  const [confirmar, setConfirmar] = useState<Local | null>(null)
  const [editando, setEditando] = useState<Local | null>(null)
  const [excluindo, setExcluindo] = useState<Local | null>(null)
  const [deleting, setDeleting] = useState(false)

  const form = useForm<FormValues>({
    defaultValues: { nome: '', tipo: '', bloco: '', andar: '', descricao: '' },
  })

  function abrirCriacao() {
    setEditando(null)
    form.reset({ nome: '', tipo: '', bloco: '', andar: '', descricao: '' })
    setDrawerOpen(true)
  }

  function abrirEdicao(local: Local) {
    setEditando(local)
    form.reset({
      nome: local.nome,
      tipo: local.tipo ?? '',
      bloco: local.bloco ?? '',
      andar: local.andar ?? '',
      descricao: local.descricao ?? '',
    })
    setSelecionado(null)
    setDrawerOpen(true)
  }

  async function onSubmit(values: FormValues) {
    setSaving(true)
    try {
      if (editando) {
        const res = await fetch(`/api/locais/${editando.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: values.nome,
            tipo: values.tipo || undefined,
            bloco: values.bloco || undefined,
            andar: values.andar || undefined,
            descricao: values.descricao || undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error?.message ?? 'Erro ao atualizar local')
          return
        }
        setLocais((prev) =>
          prev.map((l) =>
            l.id === editando.id
              ? {
                  ...l,
                  nome: values.nome,
                  tipo: values.tipo || null,
                  bloco: values.bloco || null,
                  andar: values.andar || null,
                  descricao: values.descricao || null,
                }
              : l
          )
        )
        toast.success('Local atualizado')
      } else {
        const res = await fetch('/api/locais', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: values.nome,
            tipo: values.tipo || undefined,
            bloco: values.bloco || undefined,
            andar: values.andar || undefined,
            descricao: values.descricao || undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error?.message ?? 'Erro ao criar local')
          return
        }
        setLocais((prev) => [
          ...prev,
          { ...values, id: json.data.id, ativo: true, total_inspecoes: 0, iql_medio: null },
        ])
        toast.success('Local adicionado')
      }
      form.reset()
      setEditando(null)
      setDrawerOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function excluirLocal(local: Local) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/locais/${local.id}?permanente=true`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao excluir local')
        return
      }
      setLocais((prev) => prev.filter((l) => l.id !== local.id))
      setSelecionado((prev) => (prev && prev.id === local.id ? null : prev))
      setExcluindo(null)
      toast.success('Local excluído')
    } finally {
      setDeleting(false)
    }
  }

  async function abrirDetalhe(local: Local) {
    setSelecionado(local)
    setHistorico([])
    const res = await fetch(`/api/inspecoes?local_id=${local.id}&limit=5`)
    const json = await res.json()
    if (res.ok) setHistorico(json.data?.inspecoes ?? [])
  }

  async function alternarAtivo(local: Local) {
    const res = await fetch(`/api/locais/${local.id}`, {
      method: local.ativo ? 'DELETE' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: local.ativo ? undefined : JSON.stringify({ ativo: true }),
    })
    if (!res.ok) {
      toast.error('Erro ao atualizar status')
      return
    }
    setLocais((prev) => prev.map((l) => (l.id === local.id ? { ...l, ativo: !l.ativo } : l)))
    setSelecionado((prev) => (prev && prev.id === local.id ? { ...prev, ativo: !prev.ativo } : prev))
    setConfirmar(null)
    toast.success(local.ativo ? 'Local desativado' : 'Local ativado')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Locais
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Gerencie os locais inspecionados
          </p>
        </div>
        <Button className="btn-primary" onClick={abrirCriacao}>
          Adicionar local
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {locais.map((l) => (
          <GlassCard
            key={l.id}
            className="flex flex-col gap-2 cursor-pointer"
            onClick={() => abrirDetalhe(l)}
          >
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {l.nome}
              </span>
              <Badge variant={l.ativo ? 'default' : 'secondary'}>{l.ativo ? 'Ativo' : 'Inativo'}</Badge>
            </div>
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {[l.tipo, l.bloco, l.andar].filter(Boolean).join(' · ') || 'Sem detalhes adicionais'}
            </p>
            <div className="flex gap-4 text-[12px]" style={{ color: 'var(--text-muted)' }}>
              <span>{l.total_inspecoes} inspeções</span>
              <span>IQL {formatPercent(l.iql_medio)}</span>
            </div>
          </GlassCard>
        ))}
        {locais.length === 0 && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Nenhum local cadastrado ainda.
          </p>
        )}
      </div>

      <Sheet
        open={drawerOpen}
        onOpenChange={(v) => {
          setDrawerOpen(v)
          if (!v) setEditando(null)
        }}
      >
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{editando ? 'Editar local' : 'Adicionar local'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex flex-col gap-1.5">
              <Label>Nome *</Label>
              <Input {...form.register('nome', { required: true })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Tipo</Label>
              <Input {...form.register('tipo')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Bloco</Label>
                <Input {...form.register('bloco')} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Andar</Label>
                <Input {...form.register('andar')} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Descrição</Label>
              <Textarea rows={3} {...form.register('descricao')} />
            </div>
            <Button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={!!selecionado} onOpenChange={(v) => !v && setSelecionado(null)}>
        <DialogContent>
          {selecionado && (
            <>
              <DialogHeader>
                <DialogTitle>{selecionado.nome}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 text-[13px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total de inspeções</p>
                    <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>{selecionado.total_inspecoes}</p>
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>IQL médio</p>
                    <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>{formatPercent(selecionado.iql_medio)}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    Inspeções recentes
                  </p>
                  {historico.length === 0 && (
                    <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Nenhuma inspeção ainda.</p>
                  )}
                  <div className="flex flex-col divide-y divide-[#dce3de]">
                    {historico.map((h) => (
                      <div key={h.id} className="flex items-center justify-between py-1.5">
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {formatDate(h.data_inspecao)} · {h.zelador?.nome ?? '—'} · {formatStatus(h.status)}
                        </span>
                        <span style={{ color: 'var(--text-primary)' }}>{formatPercent(h.indice_qualidade)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-1 flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => abrirEdicao(selecionado)}>
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant={selecionado.ativo ? 'destructive' : 'default'}
                    className="flex-1"
                    onClick={() => setConfirmar(selecionado)}
                  >
                    {selecionado.ativo ? 'Desativar' : 'Ativar'}
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setExcluindo(selecionado)}
                >
                  Excluir local
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmar}
        onOpenChange={(v) => !v && setConfirmar(null)}
        title={confirmar?.ativo ? 'Desativar local?' : 'Ativar local?'}
        description={
          confirmar?.ativo
            ? 'O local deixará de aparecer nas listas de seleção para novas inspeções.'
            : 'O local voltará a aparecer nas listas de seleção.'
        }
        confirmLabel={confirmar?.ativo ? 'Desativar' : 'Ativar'}
        destructive={!!confirmar?.ativo}
        onConfirm={() => confirmar && alternarAtivo(confirmar)}
      />

      <ConfirmDialog
        open={!!excluindo}
        onOpenChange={(v) => !v && setExcluindo(null)}
        title={`Excluir "${excluindo?.nome}"?`}
        description="Esta ação é permanente e não pode ser desfeita. Se houver inspeções vinculadas a este local, a exclusão será bloqueada — desative-o nesse caso."
        confirmLabel="Excluir"
        destructive
        loading={deleting}
        onConfirm={() => excluindo && excluirLocal(excluindo)}
      />
    </div>
  )
}
