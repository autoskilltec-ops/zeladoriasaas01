import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { NovaInspecaoForm } from './NovaInspecaoForm'

export const dynamic = 'force-dynamic'

export default async function NovaInspecaoPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const [{ data: locais }, { data: zeladores }] = await Promise.all([
    supabase.from('locais').select('id, nome').eq('ativo', true).order('nome'),
    supabase.from('zeladores').select('id, nome').eq('ativo', true).order('nome'),
  ])

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <NovaInspecaoForm
        userName={user.nome}
        isAdmin={['admin', 'gestor'].includes(user.role)}
        locais={(locais ?? []).map((l) => ({ id: l.id, label: l.nome }))}
        zeladores={(zeladores ?? []).map((z) => ({ id: z.id, label: z.nome }))}
      />
    </div>
  )
}
