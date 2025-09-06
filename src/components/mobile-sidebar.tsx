// components/mobile-sidebar.tsx
'use client'

import { useEffect } from 'react'
import { X, LogOut, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { useAuth } from '@/lib/auth-client'
import Link from 'next/link'

export default function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, signOut } = useAuth()

  // Close on navigation (optional): comment this out if it conflicts with your routing
  useEffect(() => {
    const handler = () => onOpenChange(false)
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [onOpenChange])

  return (
    <div
      id="mobile-sidebar"
      className={cn(
        'fixed inset-0 z-[100] md:hidden transition-opacity',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={() => onOpenChange(false)} />

      {/* Slide-over */}
      <aside
        className={cn(
          'absolute left-0 top-0 h-full w-72 max-w-[85%] glass smooth border-r',
          'transform transition-transform duration-200 ease-out will-change-transform',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <img src="/icons/icon-192.png" alt="Invoice Pro" className="h-7 w-7 rounded-md" />
            <div className="font-semibold">Menu</div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Only auth action here; main navigation is in bottom tab bar */}
        <div className="p-3">
          {user ? (
            <Button className="w-full justify-start gap-3" variant="ghost" onClick={() => { onOpenChange(false); void signOut() }}>
              <LogOut className="h-5 w-5" /> Sign out
            </Button>
          ) : (
            <Link
              href="/auth/sign-in"
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted smooth"
            >
              <LogIn className="h-5 w-5" /> Sign in
            </Link>
          )}
        </div>
      </aside>
    </div>
  )
}