'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Package, FileText, Receipt, BarChart3, Settings } from 'lucide-react'
import { useAuth } from '@/lib/auth-client'

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/items', label: 'Items', icon: Package },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/purchases', label: 'Purchases', icon: Receipt },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { loading } = useAuth()
  if (loading || pathname.startsWith('/auth')) return null

  return (
    <aside className="hidden md:flex group/aside flex-col glass smooth w-16 hover:w-64">
      <div className="px-3 py-4 text-sm font-semibold">IP</div>
      <nav className="flex-1 px-2 py-2 space-y-1">
        {NAV.map((n) => {
          const Icon = n.icon
          const active = pathname === n.href || pathname.startsWith(n.href + '/')
          return (
            <Link key={n.href} href={n.href} className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors smooth',
              active ? 'bg-primary/10 text-foreground' : 'hover:bg-muted'
            )}>
              <Icon className={cn('h-5 w-5 min-w-5', active && 'text-[hsl(var(--primary))]')} />
              <span className="opacity-0 translate-x-[-4px] md:group-hover/aside:opacity-100 md:group-hover/aside:translate-x-0 transition-all">
                {n.label}
              </span>
            </Link>
          )
        })}
      </nav>
      <div className="p-2 text-xs text-muted-foreground opacity-0 md:group-hover/aside:opacity-100 transition-opacity">
        Offline-ready
      </div>
    </aside>
  )
}