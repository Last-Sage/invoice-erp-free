// app/auth/sign-up/page.tsx
export const dynamic = 'force-dynamic'

'use client'
import { useState } from 'react'
import { useAuth } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function SignUpPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false); const [error, setError] = useState('')
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signUpWithEmail(email, password)
    setLoading(false)
    if (error) setError(error.message || 'Failed to sign up')
    else router.replace('/')
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <Card>
        <CardHeader><CardTitle>Create account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <Input label="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</Button>
          </form>
          <Button variant="secondary" className="w-full" onClick={signInWithGoogle}>Continue with Google</Button>
          <div className="text-sm text-muted-foreground">
            Already have an account? <a className="text-primary hover:underline" href="/auth/sign-in">Sign in</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}