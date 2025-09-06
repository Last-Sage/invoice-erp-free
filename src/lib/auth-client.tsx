// lib/auth-client.tsx
'use client'
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { initOnlineSync, initBackgroundSync, syncNow } from '@/lib/sync'
import { useRouter } from 'next/navigation'

type AuthCtx = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error?: any }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: any }>
  signInWithGoogle: () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const cleanupRef = useRef<(() => void) | null>(null)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      setUser(data.session?.user || null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      // Broadcast basic auth event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(newSession?.user ? 'auth:signed-in' : 'auth:signed-out'))
      }
      // Stop old sync listeners
      cleanupRef.current?.()
      cleanupRef.current = null

      if (newSession?.user) {
        const u = newSession.user
        try {
          if (navigator.onLine) await syncNow(u.id)
        } finally {
          // After initial sync, notify pages to reload data
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sync:complete'))
          }
        }
        const off1 = initOnlineSync(u.id)
        const off2 = initBackgroundSync(u.id)
        cleanupRef.current = () => { off1?.(); off2?.() }
      } else {
        // Signed out: redirect immediately so no stale UI
        router.replace('/auth/sign-in')
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    // onAuthStateChange will handle router.replace
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }, [])
  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }, [])
  const signInWithGoogle = useCallback(async () => {
    const redirectTo = typeof window !== 'undefined' ? `${location.origin}/auth/callback` : undefined
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  }, [])

  return (
    <Ctx.Provider value={{ user, session, loading, signOut, signInWithEmail, signUpWithEmail, signInWithGoogle }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}