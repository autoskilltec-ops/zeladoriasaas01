'use client'

import { LayoutDashboard, ClipboardPlus, History, BarChart2, User } from 'lucide-react'
import { Sidebar, type NavItem } from './Sidebar'
import { TopBar } from './TopBar'

export const NAV_INSPETOR: NavItem[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/inspecao/nova', icon: ClipboardPlus, label: 'Nova Inspeção' },
  { href: '/historico', icon: History, label: 'Histórico' },
  { href: '/relatorios', icon: BarChart2, label: 'Relatórios' },
  { href: '/perfil', icon: User, label: 'Perfil' },
]

interface SidebarInspetorProps {
  userName?: string
}

export function SidebarInspetor({ userName }: SidebarInspetorProps) {
  return (
    <>
      <TopBar items={NAV_INSPETOR} />
      <Sidebar items={NAV_INSPETOR} userName={userName} userRole="Inspetor" profileHref="/perfil" />
    </>
  )
}
