import { SidebarInspetor } from '@/components/layout/SidebarInspetor'
import { getAuthUser } from '@/lib/api/helpers'

export const dynamic = 'force-dynamic'

export default async function InspetorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = await getAuthUser()

  return (
    <div className="app-bg min-h-screen">
      <SidebarInspetor userName={user?.nome} />
      <main className="md:pl-16 lg:pl-60 pb-16 md:pb-0">{children}</main>
    </div>
  )
}
