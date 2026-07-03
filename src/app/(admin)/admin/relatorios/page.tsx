import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { RelatoriosClient } from './RelatoriosClient'

export const dynamic = 'force-dynamic'

export default async function AdminRelatoriosPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')
  if (!['admin', 'gestor'].includes(user.role)) redirect('/dashboard')

  const [{ data: inspetores }, { data: locais }, { data: zeladores }] = await Promise.all([
    supabase.from('usuarios').select('id, nome').eq('role', 'inspetor').order('nome'),
    supabase.from('locais').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('zeladores').select('id, nome').eq('ativo', true).order('nome'),
  ])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <RelatoriosClient
        inspetores={(inspetores ?? []).map((i) => ({ id: i.id, label: i.nome }))}
        locais={(locais ?? []).map((l) => ({ id: l.id, label: l.nome }))}
        zeladores={(zeladores ?? []).map((z) => ({ id: z.id, label: z.nome }))}
      />
    </div>
  )
}
