// components/auth-guard.tsx
'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-client'

const PUBLIC_ROUTES = ['/auth/sign-in', '/auth/sign-up', '/auth/callback']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      router.replace('/auth/sign-in')
    }
  }, [user, loading, pathname, router])

  return <>{children}</>
}