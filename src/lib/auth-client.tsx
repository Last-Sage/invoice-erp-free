// lib/auth-client.tsx
'use client'
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase/client'
import { initOnlineSync, initBackgroundSync, syncNow } from './sync'

type AuthCtx = { /* unchanged */ }
const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      setUser(data.session?.user || null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      // re-init sync listeners
      cleanupRef.current?.()
      if (newSession?.user) {
        const u = newSession.user
        try { if (navigator.onLine) await syncNow(u.id) } catch {}
        const off1 = initOnlineSync(u.id)
        const off2 = initBackgroundSync(u.id)
        cleanupRef.current = () => { off1?.(); off2?.() }
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    cleanupRef.current?.()
    cleanupRef.current = null
    setUser(null); setSession(null)
  }, [])

  // rest unchanged...
  // return provider as before
  return <Ctx.Provider value={{
    user, session, loading,
    signOut,
    signInWithEmail: async (email, password) => { const { error } = await supabase.auth.signInWithPassword({ email, password }); return { error } },
    signUpWithEmail: async (email, password) => { const { error } = await supabase.auth.signUp({ email, password }); return { error } },
    signInWithGoogle: async () => {
      const redirectTo = typeof window !== 'undefined' ? `${location.origin}/auth/callback` : undefined
      await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
    },
  }}>{children}</Ctx.Provider>
}
export const useAuth = () => { const ctx = useContext(Ctx); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx }