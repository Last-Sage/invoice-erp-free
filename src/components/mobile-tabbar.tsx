// components/mobile-tabbar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Package, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/', icon: LayoutDashboard, label: 'Home' },
  { href: '/invoices', icon: FileText, label: 'Invoices' },
  { href: '/customers', icon: Users, label: 'Customers' },
  { href: '/items', icon: Package, label: 'Items' },
  { href: '/reports', icon: BarChart3, label: 'Reports' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function MobileTabbar() {
  const pathname = usePathname()
  if (pathname.startsWith('/auth')) return null
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/80 backdrop-blur border-t md:hidden">
      <div className="grid grid-cols-6">
        {TABS.map(t => {
          const Icon = t.icon
          const active = pathname === t.href || pathname.startsWith(t.href + '/')
          return (
            <Link key={t.href} href={t.href} className="flex flex-col items-center py-2 text-xs">
              <Icon className={cn('w-5 h-5', active && 'text-[hsl(var(--primary))]')} />
              <span className={cn('mt-1', active && 'text-[hsl(var(--primary))]')}>{t.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}