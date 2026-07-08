'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Star, ThumbsUp, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/shared/GlassCard'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { formatDateTime, formatPercent } from '@/lib/utils/formatters'
import type { ReconhecimentoNivel } from '@/types/database'

interface Zelador {
  id: string
  nome: string
  matricula: string | null
  setor: string | null
  ativo: boolean
  total_avaliacoes: number
  avaliacao_media: number | null
}

interface MuralItem {
  id: string
  nivel: ReconhecimentoNivel
  descricao: string | null
  created_at: string
  zelador: string
}

interface FormValues {
  nome: string
}

const NIVEL_ICON: Record<ReconhecimentoNivel, typeof Star> = {
  excelente: Star,
  bom_exemplo: ThumbsUp,
  merece_reconhecimento: Trophy,
}

const NIVEL_LABEL: Record<ReconhecimentoNivel, string> = {
  excelente: 'Excelente',
  bom_exemplo: 'Bom exemplo',
  merece_reconhecimento: 'Merece reconhecimento',
}

export function ZeladoresClient({
  zeladoresIniciais,
  mural,
}: {
  zeladoresIniciais: Zelador[]
  mural: MuralItem[]
}) {
  const [zeladores, setZeladores] = useState<Zelador[]>(zeladoresIniciais)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmar, setConfirmar] = useState<Zelador | null>(null)
  const [editando, setEditando] = useState<Zelador | null>(null)
  const [excluindo, setExcluindo] = useState<Zelador | null>(null)
  const [deleting, setDeleting] = useState(false)

  const form = useForm<FormValues>({ defaultValues: { nome: '' } })

  function abrirCriacao() {
    setEditando(null)
    form.reset({ nome: '' })
    setDrawerOpen(true)
  }

  function abrirEdicao(zelador: Zelador) {
    setEditando(zelador)
    form.reset({ nome: zelador.nome })
    setDrawerOpen(true)
  }

  async function onSubmit(values: FormValues) {
    setSaving(true)
    try {
      if (editando) {
        const res = await fetch(`/api/zeladores/${editando.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: values.nome }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error?.message ?? 'Erro ao atualizar zelador')
          return
        }
        setZeladores((prev) =>
          prev.map((z) => (z.id === editando.id ? { ...z, nome: values.nome } : z))
        )
        toast.success('Zelador atualizado')
      } else {
        const res = await fetch('/api/zeladores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: values.nome }),
        })
        const json = await res.json()
        if (!res.ok) {
          toast.error(json.error?.message ?? 'Erro ao criar zelador')
          return
        }
        setZeladores((prev) => [
          ...prev,
          { ...values, matricula: null, setor: null, id: json.data.id, ativo: true, total_avaliacoes: 0, avaliacao_media: null },
        ])
        toast.success('Zelador adicionado')
      }
      form.reset()
      setEditando(null)
      setDrawerOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function excluirZelador(zelador: Zelador) {
    setDeleting(true)
    try {
      const res = await fetch(`/api/zeladores/${zelador.id}?permanente=true`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error?.message ?? 'Erro ao excluir zelador')
        return
      }
      setZeladores((prev) => prev.filter((z) => z.id !== zelador.id))
      toast.success('Zelador excluído')
      setExcluindo(null)
    } finally {
      setDeleting(false)
    }
  }

  async function alternarAtivo(zelador: Zelador) {
    const res = await fetch(`/api/zeladores/${zelador.id}`, {
      method: zelador.ativo ? 'DELETE' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: zelador.ativo ? undefined : JSON.stringify({ ativo: true }),
    })
    if (!res.ok) {
      toast.error('Erro ao atualizar status')
      return
    }
    setZeladores((prev) => prev.map((z) => (z.id === zelador.id ? { ...z, ativo: !z.ativo } : z)))
    setConfirmar(null)
    toast.success(zelador.ativo ? 'Zelador desativado' : 'Zelador ativado')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Zeladores
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Gerencie a equipe de zeladoria
          </p>
        </div>
        <Button className="btn-primary" onClick={abrirCriacao}>
          Adicionar zelador
        </Button>
      </div>

      <GlassCard>
        {zeladores.length === 0 ? (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Nenhum zelador cadastrado ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b" style={{ borderColor: '#dce3de' }}>
                  <th className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Nome</th>
                  <th className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Matrícula</th>
                  <th className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Setor</th>
                  <th className="py-2 pr-3 text-right text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Avaliação média</th>
                  <th className="py-2 pr-3 text-right text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Total</th>
                  <th className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Status</th>
                  <th className="py-2 pr-3" />
                </tr>
              </thead>
              <tbody>
                {zeladores.map((z) => (
                  <tr key={z.id} className="border-b last:border-0" style={{ borderColor: '#eef1ee' }}>
                    <td className="py-2 pr-3" style={{ color: 'var(--text-primary)' }}>{z.nome}</td>
                    <td className="py-2 pr-3" style={{ color: 'var(--text-secondary)' }}>{z.matricula ?? '—'}</td>
                    <td className="py-2 pr-3" style={{ color: 'var(--text-secondary)' }}>{z.setor ?? '—'}</td>
                    <td className="py-2 pr-3 text-right" style={{ color: 'var(--text-primary)' }}>{formatPercent(z.avaliacao_media)}</td>
                    <td className="py-2 pr-3 text-right" style={{ color: 'var(--text-primary)' }}>{z.total_avaliacoes}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={z.ativo ? 'default' : 'secondary'}>{z.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => abrirEdicao(z)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setConfirmar(z)}>
                          {z.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setExcluindo(z)}>
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <div>
        <h2 className="mb-3 text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Mural de reconhecimento
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mural.map((m) => {
            const Icon = NIVEL_ICON[m.nivel]
            return (
              <GlassCard key={m.id} variant="accent" className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Icon size={16} style={{ color: 'var(--gold)' }} />
                  <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                    {m.zelador}
                  </span>
                  <Badge variant="secondary">{NIVEL_LABEL[m.nivel]}</Badge>
                </div>
                {m.descricao && (
                  <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                    {m.descricao}
                  </p>
                )}
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {formatDateTime(m.created_at)}
                </p>
              </GlassCard>
            )
          })}
          {mural.length === 0 && (
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              Nenhum reconhecimento registrado ainda.
            </p>
          )}
        </div>
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
            <SheetTitle>{editando ? 'Editar zelador' : 'Adicionar zelador'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex flex-col gap-1.5">
              <Label>Nome *</Label>
              <Input {...form.register('nome', { required: true })} />
            </div>
            <Button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!confirmar}
        onOpenChange={(v) => !v && setConfirmar(null)}
        title={confirmar?.ativo ? 'Desativar zelador?' : 'Ativar zelador?'}
        confirmLabel={confirmar?.ativo ? 'Desativar' : 'Ativar'}
        destructive={!!confirmar?.ativo}
        onConfirm={() => confirmar && alternarAtivo(confirmar)}
      />

      <ConfirmDialog
        open={!!excluindo}
        onOpenChange={(v) => !v && setExcluindo(null)}
        title={`Excluir "${excluindo?.nome}"?`}
        description="Esta ação é permanente e não pode ser desfeita. Se houver inspeções vinculadas a este zelador, a exclusão será bloqueada — desative-o nesse caso."
        confirmLabel="Excluir"
        destructive
        loading={deleting}
        onConfirm={() => excluindo && excluirZelador(excluindo)}
      />
    </div>
  )
}
