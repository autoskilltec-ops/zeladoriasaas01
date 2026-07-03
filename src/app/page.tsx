import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export default async function RootPage() {
  const { user } = await getAuthUser()

  if (!user) redirect('/login')
  if (user.role === 'inspetor') redirect('/dashboard')
  redirect('/admin/dashboard')
}
