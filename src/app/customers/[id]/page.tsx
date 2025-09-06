// app/customers/[id]/page.tsx
'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import ConfirmButton from '@/components/ui/confirm-button'

export default function ViewCustomer() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [form, setForm] = useState<any | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => { (async () => setForm(await db.get('customers', id)))() }, [id])

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form?.name?.trim()) e.name = 'Name is required'
    if (form?.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!form) return
    if (!validate()) return
    await db.upsert('customers', form)
    router.push('/customers')
  }

  if (!form) return <div>Loading...</div>
  return (
    <Card className="max-w-3xl">
      <CardHeader><CardTitle>Edit Customer</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Name" error={errors.name} value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Input label="Email" error={errors.email} value={form.email || ''} onChange={(e) => set('email', e.target.value)} />
          <Input label="Phone" value={form.phone || ''} onChange={(e) => set('phone', e.target.value)} />
          <Input label="Tax ID" value={form.taxId || ''} onChange={(e) => set('taxId', e.target.value)} />
        </div>
        <Textarea label="Billing Address" value={form.billingAddress?.line1 || ''} onChange={(e) => set('billingAddress', { ...form.billingAddress, line1: e.target.value })} />
        <Textarea label="Shipping Address" value={form.shippingAddress?.line1 || ''} onChange={(e) => set('shippingAddress', { ...form.shippingAddress, line1: e.target.value })} />
        <div className="flex gap-2">
          <Button onClick={save}>Save</Button>
          <Button variant="secondary" asChild><Link href="/customers">Cancel</Link></Button>
          <ConfirmButton onConfirm={async () => { await db.remove('customers', form.id); router.push('/customers') }}>
            Delete
          </ConfirmButton>
        </div>
      </CardContent>
    </Card>
  )
}