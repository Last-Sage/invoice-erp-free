// app/auth/callback/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function Callback() {
  const router = useRouter()
  useEffect(() => {
    const handler = async () => {
      // supabase-js persists session automatically; just move on
      router.replace('/')
    }
    handler()
  }, [router])
  return <div className="text-sm text-muted-foreground">Signing you in…</div>
}