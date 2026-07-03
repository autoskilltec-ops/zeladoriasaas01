'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { NavItem } from './Sidebar'

interface TopBarProps {
  items: NavItem[]
  title?: string
}

export function TopBar({ items, title = 'ZeladoriaSaaS' }: TopBarProps) {
  const [open, setOpen] = useState(false)

  return (
    <header
      className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3"
      style={{ background: 'var(--bg-app)', borderColor: '#dce3de' }}
    >
      <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {title}
      </span>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)} aria-label="Abrir menu">
        <Menu size={20} />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4 pb-4">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}
