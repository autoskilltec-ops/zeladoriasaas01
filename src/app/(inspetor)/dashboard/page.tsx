import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ClipboardPlus } from 'lucide-react'
import { getAuthUser } from '@/lib/api/helpers'
import { getDashboardData } from '@/lib/api/dashboard'
import { GlassCard } from '@/components/shared/GlassCard'
import { CircularProgress } from '@/components/shared/CircularProgress'
import { Button } from '@/components/ui/button'
import { formatDate, formatPercent, formatStatus } from '@/lib/utils/formatters'
import { classificarIndice } from '@/lib/utils/calculos'

export const dynamic = 'force-dynamic'

export default async function DashboardInspetorPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const data = await getDashboardData(supabase, user, 'mes')
  const classificacao = classificarIndice(data.iql_medio)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 flex flex-col gap-5">
      <div>
        <h1 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>
          Olá, {user.nome.split(' ')[0]}
        </h1>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
          Resumo do mês atual
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GlassCard className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Minhas Inspeções
          </span>
          <span className="text-[24px] font-medium" style={{ color: 'var(--text-primary)' }}>
            {data.total_inspecoes}
          </span>
        </GlassCard>

        <GlassCard className="flex items-center gap-3">
          <CircularProgress value={data.iql_medio} size={52} strokeWidth={5} color={classificacao.color} />
          <div>
            <span
              className="block text-[11px] uppercase tracking-wide"
              style={{ color: 'var(--text-muted)' }}
            >
              IQL Médio
            </span>
            <span className="text-[13px] font-medium" style={{ color: classificacao.color }}>
              {classificacao.label}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            NCs Abertas
          </span>
          <span className="text-[24px] font-medium" style={{ color: 'var(--critico)' }}>
            {data.ncs_abertas}
          </span>
        </GlassCard>
      </div>

      {data.ultimas_inspecoes.length === 0 ? (
        <GlassCard variant="accent" className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>
            Você ainda não tem inspeções neste mês.
          </p>
          <Button className="btn-primary" nativeButton={false} render={<Link href="/inspecao/nova" />}>
            <ClipboardPlus size={16} className="mr-1.5" />
            Nova Inspeção
          </Button>
        </GlassCard>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
              Últimas inspeções
            </h2>
            <Button size="sm" className="btn-primary" nativeButton={false} render={<Link href="/inspecao/nova" />}>
              Nova Inspeção
            </Button>
          </div>
          {data.ultimas_inspecoes.map((i) => (
            <GlassCard key={i.id} variant="sm" className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {i.local}
                </p>
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(i.data)} · {i.zelador} · {formatStatus(i.status)}
                </p>
              </div>
              <span className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {formatPercent(i.iql)}
              </span>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  )
}
