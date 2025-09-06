// app/purchases/new/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { Select } from '@/components/ui/select'

export default function NewPurchase() {
  const router = useRouter()
  const [form, setForm] = useState<any>({
    vendor: '', date: new Date().toISOString(), dueDate: new Date().toISOString(), status: 'unpaid',
    lines: [{ description: '', amount: '' }], category: '', notes: ''
  })
  const [errors, setErrors] = useState<Record<string,string>>({})

  const addLine = () => setForm((f: any) => ({ ...f, lines: [...f.lines, { description: '', amount: '' }] }))
  const setLine = (i: number, patch: any) => setForm((f: any) => ({ ...f, lines: f.lines.map((l: any, idx: number) => idx === i ? { ...l, ...patch } : l) }))
  const removeLine = (i: number) => setForm((f:any)=>({...f, lines: f.lines.filter((_:any,idx:number)=>idx!==i)}))

  const total = form.lines.reduce((s: number, l: any) => s + Number(l.amount || 0), 0)

  const validate = () => {
    const e: Record<string,string> = {}
    if (!form.vendor?.trim()) e.vendor = 'Vendor is required'
    if (new Date(form.dueDate) < new Date(form.date)) e.dueDate = 'Due date cannot be earlier than date'
    form.lines.forEach((l:any, idx:number)=>{
      if (!l.description?.trim()) e[`line_${idx}_description`] = 'Description required'
      const a = Number(l.amount)
      if (isNaN(a) || a < 0) e[`line_${idx}_amount`] = 'Amount must be ≥ 0'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    const payload = { ...form, total: total, lines: form.lines.map((l:any)=>({ ...l, amount: Number(l.amount||0)})) }
    const saved = await db.upsert('purchases', payload)
    router.push(`/purchases/${saved.id}`)
  }

  return (
    <Card className="max-w-4xl">
      <CardHeader><CardTitle>New Purchase / Expense</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-5 gap-4">
  <Input label="Vendor" value={form.vendor} onChange={(e) => setForm((f: any) => ({ ...f, vendor: e.target.value }))} error={errors.vendor} />
  <Input label="Date" type="date" value={form.date.slice(0,10)} onChange={(e) => setForm((f: any) => ({ ...f, date: new Date(e.target.value).toISOString() }))} />
  <Input label="Due" error={errors.dueDate} type="date" value={form.dueDate.slice(0,10)} onChange={(e) => setForm((f: any) => ({ ...f, dueDate: new Date(e.target.value).toISOString() }))} />
  <Input label="Category" value={form.category} onChange={(e) => setForm((f: any) => ({ ...f, category: e.target.value }))} />
  <Select label="Status" value={form.status} onValueChange={(v)=> setForm((f:any)=>({ ...f, status: v }))} options={[
    { label: 'Unpaid', value: 'unpaid' }, { label: 'Partial', value: 'partial' }, { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }
  ]} />
</div>

        <div className="rounded-md border overflow-hidden">
          <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 text-sm font-medium">
            <div className="col-span-9">Description</div>
            <div className="col-span-3 text-right pr-2">Amount</div>
          </div>
          {form.lines.map((l: any, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-2 p-2 border-t">
              <div className="col-span-9"><Input error={errors[`line_${idx}_description`]} value={l.description} onChange={(e) => setLine(idx, { description: e.target.value })} placeholder="Description" /></div>
              <div className="col-span-3 flex gap-2">
                <Input className="flex-1" type="number" step="0.01" error={errors[`line_${idx}_amount`]} value={l.amount} onChange={(e) => setLine(idx, { amount: e.target.value })} />
                <Button variant="ghost" onClick={()=>removeLine(idx)}>Remove</Button>
              </div>
            </div>
          ))}
          <div className="p-2 border-t">
            <Button variant="secondary" onClick={addLine}>+ Add Line</Button>
          </div>
        </div>

        <div className="flex items-center justify-between border rounded-md p-3">
          <span className="font-medium">Total</span>
          <span className="font-semibold">{formatCurrency(total)}</span>
        </div>

        <div className="flex gap-2">
          <Button onClick={save}>Save</Button>
        </div>
      </CardContent>
    </Card>
  )
}