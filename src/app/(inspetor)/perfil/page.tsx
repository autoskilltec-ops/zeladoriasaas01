import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { PerfilContent } from '@/components/shared/PerfilContent'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')

  const [{ data: org }, { data: usuario }] = await Promise.all([
    supabase.from('organizacoes').select('nome').eq('id', user.organizacao_id).single(),
    supabase.from('usuarios').select('created_at').eq('id', user.id).single(),
  ])

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <PerfilContent
        nome={user.nome}
        email={user.email}
        role={user.role}
        organizacaoNome={org?.nome ?? '—'}
        criadoEm={usuario?.created_at ?? null}
      />
    </div>
  )
}
