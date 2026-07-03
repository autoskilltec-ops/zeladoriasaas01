'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/shared/GlassCard'
import { supabase } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils/formatters'
import type { UserRole } from '@/types/database'

interface PerfilContentProps {
  nome: string
  email: string
  role: UserRole
  organizacaoNome: string
  criadoEm: string | null
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  gestor: 'Gestor',
  inspetor: 'Inspetor',
}

export function PerfilContent({ nome, email, role, organizacaoNome, criadoEm }: PerfilContentProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Erro ao sair da conta')
      setLoading(false)
      return
    }
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Perfil
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Suas informações de conta
        </p>
      </div>

      <GlassCard className="flex flex-col items-center gap-3 py-8 text-center">
        <div
          className="flex size-16 items-center justify-center rounded-full text-[24px] font-medium"
          style={{ background: 'var(--forest-600)', color: '#fff' }}
        >
          {nome.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {nome}
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {email}
          </p>
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col divide-y divide-[#dce3de]">
        <div className="flex items-center justify-between py-2 text-[13px]">
          <span style={{ color: 'var(--text-secondary)' }}>Função</span>
          <span style={{ color: 'var(--text-primary)' }}>{ROLE_LABEL[role] ?? role}</span>
        </div>
        <div className="flex items-center justify-between py-2 text-[13px]">
          <span style={{ color: 'var(--text-secondary)' }}>Organização</span>
          <span style={{ color: 'var(--text-primary)' }}>{organizacaoNome}</span>
        </div>
        {criadoEm && (
          <div className="flex items-center justify-between py-2 text-[13px]">
            <span style={{ color: 'var(--text-secondary)' }}>Membro desde</span>
            <span style={{ color: 'var(--text-primary)' }}>{formatDate(criadoEm)}</span>
          </div>
        )}
      </GlassCard>

      <Button type="button" variant="destructive" onClick={handleLogout} disabled={loading}>
        <LogOut size={16} className="mr-1.5" />
        {loading ? 'Saindo...' : 'Sair da conta'}
      </Button>
    </div>
  )
}
