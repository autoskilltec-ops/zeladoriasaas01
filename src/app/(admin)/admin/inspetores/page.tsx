import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { InspetoresClient } from './InspetoresClient'

export const dynamic = 'force-dynamic'

export default async function AdminInspetoresPage() {
  const { user, error } = await getAuthUser()
  if (error || !user) redirect('/login')
  if (!['admin', 'gestor'].includes(user.role)) redirect('/dashboard')

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <InspetoresClient />
    </div>
  )
}
