import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { HistoricoClient } from './HistoricoClient'

export const dynamic = 'force-dynamic'

export default async function HistoricoPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const { data: locais } = await supabase
    .from('locais')
    .select('id, nome')
    .eq('ativo', true)
    .order('nome')

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <HistoricoClient locais={(locais ?? []).map((l) => ({ id: l.id, label: l.nome }))} />
    </div>
  )
}
