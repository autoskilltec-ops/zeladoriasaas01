'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreHorizontal, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APP_LOGO_URL, APP_LOGO_FALLBACK_URL } from '@/lib/constants'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

export interface NavItem {
  href: string
  icon: LucideIcon
  label: string
}

interface SidebarProps {
  items: NavItem[]
  userName?: string
  userRole?: string
  profileHref?: string
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Sidebar({ items, userName, userRole, profileHref }: SidebarProps) {
  const [logoSrc, setLogoSrc] = useState(APP_LOGO_URL)

  const footer = (
    <div className="flex items-center gap-2.5 border-t border-white/10 px-4 py-4">
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] font-medium"
        style={{ background: 'rgba(255,255,255,0.12)', color: 'var(--text-on-dark)' }}
      >
        {(userName ?? '?').slice(0, 1).toUpperCase()}
      </div>
      <div className="hidden md:group-hover:flex lg:flex flex-col overflow-hidden">
        <span className="truncate text-[13px] font-medium" style={{ color: 'var(--text-on-dark)' }}>
          {userName ?? 'Usuário'}
        </span>
        <span className="truncate text-[11px]" style={{ color: 'var(--text-on-dark-muted)' }}>
          {userRole ?? ''}
        </span>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop / tablet — fixa 240px, colapsada 64px com hover expande */}
      <aside
        className="group hidden md:flex md:w-16 lg:w-60 md:hover:w-60 fixed inset-y-0 left-0 z-40 flex-col overflow-hidden transition-all duration-200"
        style={{ background: 'var(--bg-sidebar)' }}
      >
        <div className="flex items-center gap-2.5 px-4 py-5">
          <Image
            src={logoSrc}
            alt="ZeladoriaSaaS"
            width={32}
            height={33}
            priority
            unoptimized
            onError={() => setLogoSrc(APP_LOGO_FALLBACK_URL)}
            className="size-8 shrink-0 rounded-lg object-contain"
          />
          <span
            className="hidden md:group-hover:inline lg:inline whitespace-nowrap text-[15px] font-medium"
            style={{ color: 'var(--text-on-dark)' }}
          >
            ZeladoriaSaaS
          </span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-2.5">
          {items.map((item) => (
            <SidebarLink key={item.href} item={item} />
          ))}
        </nav>

        {profileHref ? (
          <Link href={profileHref} className="hover:bg-white/5">
            {footer}
          </Link>
        ) : (
          footer
        )}
      </aside>

      {/* Mobile — bottom navigation */}
      <MobileBottomNav items={items} />
    </>
  )
}

function SidebarLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const active = isActive(pathname, item.href)
  const Icon = item.icon

  return (
    <Link
      href={item.href}
      className={cn('btn-ghost-sidebar flex items-center gap-3 px-2.5 py-2.5', active && 'active')}
    >
      <Icon size={18} className="shrink-0" />
      <span className="hidden md:group-hover:inline lg:inline whitespace-nowrap text-[13px]">
        {item.label}
      </span>
    </Link>
  )
}

function MobileBottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const visible = items.slice(0, 4)
  const rest = items.slice(4)

  return (
    <>
      <nav
        className="md:hidden fixed inset-x-0 bottom-0 z-40 flex items-stretch justify-around border-t"
        style={{ background: 'var(--bg-sidebar)', borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {visible.map((item) => {
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]"
              style={{ color: active ? 'var(--text-on-dark)' : 'var(--text-on-dark-muted)' }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
        {rest.length > 0 && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]"
            style={{ color: 'var(--text-on-dark-muted)' }}
          >
            <MoreHorizontal size={18} />
            Mais
          </button>
        )}
      </nav>

      {rest.length > 0 && (
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="bottom">
            <SheetHeader>
              <SheetTitle>Mais opções</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-1 px-4 pb-4">
              {rest.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  )
}
