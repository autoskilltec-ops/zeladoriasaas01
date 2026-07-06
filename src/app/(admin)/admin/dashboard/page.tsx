import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'
import { getDashboardData } from '@/lib/api/dashboard'
import { AdminDashboardClient } from './AdminDashboardClient'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const { user, supabase, error } = await getAuthUser()
  if (error || !user) redirect('/login')
  if (!['admin', 'gestor'].includes(user.role)) redirect('/dashboard')

  const data = await getDashboardData(supabase, user, 'mes')

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <AdminDashboardClient initialData={data} />
    </div>
  )
}
