// components/mobile-sidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, LayoutDashboard, Users, Package, FileText, Receipt, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { useEffect } from 'react'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/items', label: 'Items', icon: Package },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/purchases', label: 'Purchases', icon: Receipt },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const pathname = usePathname()

  // Close on route change
  useEffect(() => { onOpenChange(false) }, [pathname]) // eslint-disable-line

  return (
    <div className={cn('fixed inset-0 z-50 md:hidden transition-opacity', open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none')}>
      <div className="absolute inset-0 bg-black/30" onClick={() => onOpenChange(false)} />
      <aside className={cn(
        'absolute left-0 top-0 h-full w-80 max-w-[85%] glass smooth translate-x-[-100%]',
        open && 'translate-x-0'
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="font-semibold">Menu</div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="px-2 py-2 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon
            const active = pathname === n.href || pathname.startsWith(n.href + '/')
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active ? 'bg-primary/10 text-foreground' : 'hover:bg-muted'
                )}
              >
                <Icon className={cn('h-5 w-5 min-w-5', active && 'text-[hsl(var(--primary))]')} />
                <span>{n.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}