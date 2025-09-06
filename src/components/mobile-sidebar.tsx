// components/mobile-sidebar.tsx
'use client'

import { X, LogOut, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { useAuth } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MobileSidebar({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    onOpenChange(false)
    router.replace('/auth/sign-in')
  }
  return (
    <div
      id="mobile-sidebar"
      className={cn(
        'fixed inset-0 z-[130] md:hidden transition-opacity',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop (lower z than panel) */}
      <div className="absolute inset-0 bg-black/30 z-[130]" onClick={() => onOpenChange(false)} />

      {/* Slide-over panel */}
     <aside
    className={cn(
        'absolute left-0 top-0 z-[140] h-full w-72 max-w-[85%] border-r bg-background/90 backdrop-blur-xl',
        'transform transition-transform duration-200 ease-out will-change-transform',
        open ? 'translate-x-0' : '-translate-x-full'
    )}
>
    <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
            <img src="/icons/icon-192.png" alt="Invoice Pro" className="h-7 w-7 rounded-md" />
            <div className="font-semibold">Menu</div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
        </Button>
    </div>

    <div className="p-3">
        {user ? (
            <Button className="w-full justify-start gap-3" variant="ghost" onClick={handleLogout}>
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