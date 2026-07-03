'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/shared/GlassCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { InspetorPopup } from '@/components/admin/InspetorPopup'
import { formatDate, formatPercent } from '@/lib/utils/formatters'

interface Inspetor {
  id: string
  nome: string
  email: string
  ativo: boolean
  total_inspecoes: number
  iql_medio: number | null
  ultima_inspecao: string | null
}

export function InspetoresClient() {
  const [inspetores, setInspetores] = useState<Inspetor[]>([])
  const [loading, setLoading] = useState(true)
  const [popupOpen, setPopupOpen] = useState(false)
  const [selecionado, setSelecionado] = useState<Inspetor | null>(null)

  useEffect(() => {
    fetch('/api/inspetores')
      .then((res) => res.json())
      .then((json) => setInspetores(json.data ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function alternarAtivo(inspetor: Inspetor) {
    const res = await fetch(`/api/inspetores/${inspetor.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !inspetor.ativo }),
    })
    if (!res.ok) {
      toast.error('Erro ao atualizar status')
      return
    }
    setInspetores((prev) =>
      prev.map((i) => (i.id === inspetor.id ? { ...i, ativo: !i.ativo } : i))
    )
    setSelecionado((prev) => (prev && prev.id === inspetor.id ? { ...prev, ativo: !prev.ativo } : prev))
    toast.success(inspetor.ativo ? 'Inspetor desativado' : 'Inspetor ativado')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
            Inspetores
          </h1>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            Gerencie os inspetores da organização
          </p>
        </div>
        <Button className="btn-primary" onClick={() => setPopupOpen(true)}>
          Novo Inspetor
        </Button>
      </div>

      <GlassCard>
        {loading && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Carregando...
          </p>
        )}
        {!loading && inspetores.length === 0 && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Nenhum inspetor cadastrado ainda.
          </p>
        )}
        {!loading && inspetores.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b" style={{ borderColor: '#dce3de' }}>
                  <th className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Nome</th>
                  <th className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>E-mail</th>
                  <th className="py-2 pr-3 text-right text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Inspeções</th>
                  <th className="py-2 pr-3 text-right text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>IQL médio</th>
                  <th className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Última inspeção</th>
                  <th className="py-2 pr-3 text-left text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {inspetores.map((i) => (
                  <tr
                    key={i.id}
                    className="border-b last:border-0 cursor-pointer hover:bg-[var(--forest-50)]"
                    style={{ borderColor: '#eef1ee' }}
                    onClick={() => setSelecionado(i)}
                  >
                    <td className="py-2 pr-3" style={{ color: 'var(--text-primary)' }}>{i.nome}</td>
                    <td className="py-2 pr-3" style={{ color: 'var(--text-secondary)' }}>{i.email}</td>
                    <td className="py-2 pr-3 text-right" style={{ color: 'var(--text-primary)' }}>{i.total_inspecoes}</td>
                    <td className="py-2 pr-3 text-right" style={{ color: 'var(--text-primary)' }}>{formatPercent(i.iql_medio)}</td>
                    <td className="py-2 pr-3" style={{ color: 'var(--text-secondary)' }}>{formatDate(i.ultima_inspecao)}</td>
                    <td className="py-2 pr-3">
                      <Badge variant={i.ativo ? 'default' : 'secondary'}>
                        {i.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <InspetorPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onSuccess={(novo) =>
          setInspetores((prev) => [
            ...prev,
            { ...novo, ativo: true, total_inspecoes: 0, iql_medio: null, ultima_inspecao: null },
          ])
        }
      />

      <Dialog open={!!selecionado} onOpenChange={(v) => !v && setSelecionado(null)}>
        <DialogContent>
          {selecionado && (
            <>
              <DialogHeader>
                <DialogTitle>{selecionado.nome}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 text-[13px]">
                <p style={{ color: 'var(--text-secondary)' }}>{selecionado.email}</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Total de inspeções</p>
                    <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>{selecionado.total_inspecoes}</p>
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>IQL médio</p>
                    <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>{formatPercent(selecionado.iql_medio)}</p>
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Última inspeção</p>
                    <p style={{ color: 'var(--text-primary)' }}>{formatDate(selecionado.ultima_inspecao)}</p>
                  </div>
                  <div>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Status</p>
                    <Badge variant={selecionado.ativo ? 'default' : 'secondary'}>
                      {selecionado.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={selecionado.ativo ? 'destructive' : 'default'}
                  className="mt-3"
                  onClick={() => alternarAtivo(selecionado)}
                >
                  {selecionado.ativo ? 'Desativar acesso' : 'Ativar acesso'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
