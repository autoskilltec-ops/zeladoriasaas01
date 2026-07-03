'use client'

import {
  LayoutDashboard,
  Users,
  MapPin,
  UserCheck,
  BarChart2,
  Settings,
  User,
} from 'lucide-react'
import { Sidebar, type NavItem } from './Sidebar'
import { TopBar } from './TopBar'

export const NAV_ADMIN: NavItem[] = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/inspetores', icon: Users, label: 'Inspetores' },
  { href: '/admin/locais', icon: MapPin, label: 'Locais' },
  { href: '/admin/zeladores', icon: UserCheck, label: 'Zeladores' },
  { href: '/admin/relatorios', icon: BarChart2, label: 'Relatórios' },
  { href: '/admin/configuracoes', icon: Settings, label: 'Configurações' },
  { href: '/admin/perfil', icon: User, label: 'Perfil' },
]

interface SidebarAdminProps {
  userName?: string
}

export function SidebarAdmin({ userName }: SidebarAdminProps) {
  return (
    <>
      <TopBar items={NAV_ADMIN} />
      <Sidebar items={NAV_ADMIN} userName={userName} userRole="Admin" profileHref="/admin/perfil" />
    </>
  )
}
