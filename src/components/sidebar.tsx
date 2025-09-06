// components/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Users, Package, FileText, Receipt, BarChart3, Settings, LogOut,
} from 'lucide-react'
import { useAuth } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'

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
  const { user, loading, signOut } = useAuth()

  // Hide during auth loading and on auth routes
  if (loading || pathname.startsWith('/auth')) return null

  return (
    <aside
      className={cn(
        // Desktop only; sticky so it stays fixed on scroll
        'hidden md:flex group/aside flex-col glass smooth',
        'sticky top-0 h-screen w-16 hover:w-64',
      )}
    >
      {/* Top brand icon (PWA icon) */}
      <div className="px-3 py-4 flex items-center">
        <img
          src="/icons/icon-192.png"
          alt="Invoice Pro"
          className="h-8 w-8 rounded-md"
        />
        <span className="ml-3 text-sm font-semibold opacity-0 md:group-hover/aside:opacity-100 transition-opacity">
          Invoice Pro
        </span>
      </div>

      {/* Nav (scrolls independently if needed) */}
      <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {NAV.map((n) => {
          const Icon = n.icon
          const active = pathname === n.href || pathname.startsWith(n.href + '/')
          return (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors smooth',
                active ? 'bg-primary/10 text-foreground' : 'hover:bg-muted'
              )}
            >
              <Icon className={cn('h-5 w-5 min-w-5', active && 'text-[hsl(var(--primary))]')} />
              <span className="opacity-0 translate-x-[-4px] md:group-hover/aside:opacity-100 md:group-hover/aside:translate-x-0 transition-all">
                {n.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions: logout */}
      <div className="px-2 py-3 border-t">
        {user ? (
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10"
            aria-label="Sign out"
            title="Sign out"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
          </Button>
        ) : (
          <Link
            href="/auth/sign-in"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted smooth"
            title="Sign in"
            aria-label="Sign in"
          >
            <LogOut className="h-5 w-5 rotate-180" />
            <span className="opacity-0 md:group-hover/aside:opacity-100 transition-opacity">Sign in</span>
          </Link>
        )}
      </div>
    </aside>
  )
}