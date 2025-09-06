// components/auth-guard.tsx (show loader while auth loading)
'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth-client'
import { Loader } from '@/components/ui/loader'

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

  if (loading && !PUBLIC_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader size={10} />
      </div>
    )
  }
  return <>{children}</>
}