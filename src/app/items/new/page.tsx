// app/items/new/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

export default function NewItem() {
  const router = useRouter()
  const [form, setForm] = useState<any>({ name: '', sku: '', unitPrice: '', purchasePrice: '', stockQty: 0, taxRate: 0, description: '' })
  const [errors, setErrors] = useState<Record<string,string>>({})

  const validate = () => {
    const e: Record<string,string> = {}
    if (!form.name?.trim()) e.name = 'Name is required'
    const sp = Number(form.unitPrice)
    if (isNaN(sp) || sp <= 0) e.unitPrice = 'Selling price must be > 0'
    const pp = form.purchasePrice === '' ? null : Number(form.purchasePrice)
    if (pp !== null && (isNaN(pp) || pp < 0)) e.purchasePrice = 'Purchase price must be ≥ 0'
    const qty = Number(form.stockQty)
    if (isNaN(qty) || qty < 0) e.stockQty = 'Stock must be ≥ 0'
    const tax = Number(form.taxRate)
    if (isNaN(tax) || tax < 0) e.taxRate = 'Tax must be ≥ 0'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    await db.upsert('items', {
      ...form,
      unitPrice: Number(form.unitPrice),
      purchasePrice: form.purchasePrice === '' ? undefined : Number(form.purchasePrice),
      stockQty: Number(form.stockQty || 0),
      taxRate: Number(form.taxRate || 0),
    })
    router.push('/items')
  }

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  return (
    <Card className="max-w-3xl">
      <CardHeader><CardTitle>New Item</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Name" error={errors.name} value={form.name} onChange={(e) => set('name', e.target.value)} />
          <Input label="SKU" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
          <Input label="Selling Price" error={errors.unitPrice} type="number" step="0.01" value={form.unitPrice} onChange={(e) => set('unitPrice', e.target.value)} />
          <Input label="Purchase Price (optional)" error={errors.purchasePrice} type="number" step="0.01" value={form.purchasePrice} onChange={(e) => set('purchasePrice', e.target.value)} />
          <Input label="Stock Qty" error={errors.stockQty} type="number" value={form.stockQty} onChange={(e) => set('stockQty', e.target.value)} />
          <Input label="Tax Rate (%)" error={errors.taxRate} type="number" step="0.01" value={form.taxRate} onChange={(e) => set('taxRate', e.target.value)} />
        </div>
        <Textarea label="Description" value={form.description} onChange={(e) => set('description', e.target.value)} />
        <div className="flex gap-2">
          <Button onClick={save}>Save</Button>
          <Button variant="secondary" asChild><Link href="/items">Cancel</Link></Button>
        </div>
      </CardContent>
    </Card>
  )
}