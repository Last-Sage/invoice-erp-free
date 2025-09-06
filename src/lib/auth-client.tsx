// lib/auth-client.tsx
'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase/client'
import { syncNow } from './sync'

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session || null)
      setUser(data.session?.user || null)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      // trigger sync when logged in and online
      if (newSession?.user && navigator.onLine) {
        try { await syncNow(newSession.user.id) } catch {}
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null); setSession(null)
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