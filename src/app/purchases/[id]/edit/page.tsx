// app/purchases/[id]/edit/page.tsx
'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

export default function EditPurchase() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [form, setForm] = useState<any | null>(null)
  const [errors, setErrors] = useState<Record<string,string>>({})

  useEffect(() => { (async () => setForm(await db.get('purchases', id)))() }, [id])

  const setLine = (i:number, patch:any)=> setForm((f:any)=>({ ...f, lines: f.lines.map((l:any,idx:number)=> idx===i ? { ...l, ...patch } : l)}))
  const addLine = ()=> setForm((f:any)=>({ ...f, lines: [...(f.lines||[]), { description: '', amount: 0 }]}))
  const removeLine = (i:number)=> setForm((f:any)=>({ ...f, lines: f.lines.filter((_:any,idx:number)=> idx!==i)}))
  const total = useMemo(()=> form ? form.lines.reduce((s:number,l:any)=> s + Number(l.amount||0), 0) : 0, [form])

  const validate = ()=> {
    const e: Record<string,string> = {}
    if (!form?.vendor?.trim()) e.vendor = 'Vendor is required'
    if (!form?.date) e.date = 'Date is required'
    if (!form?.dueDate) e.dueDate = 'Due date is required'
    if (new Date(form?.dueDate) < new Date(form?.date)) e.dueDate = 'Due cannot be earlier than date'
    setErrors(e)
    return Object.keys(e).length===0
  }

  const save = async ()=> {
    if (!form) return
    if (!validate()) return
    const payload = { ...form, total, lines: form.lines.map((l:any)=> ({ ...l, amount: Number(l.amount||0)})) }
    await db.upsert('purchases', payload)
    router.push(`/purchases/${form.id}`)
  }

  if (!form) return <div>Loading…</div>
  return (
    <Card className="max-w-4xl">
      <CardHeader><CardTitle>Edit Purchase / Expense</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-5 gap-4">
          <Input label="Vendor" error={errors.vendor} value={form.vendor} onChange={(e)=> setForm((f:any)=>({ ...f, vendor: e.target.value }))} />
          <Input label="Date" error={errors.date} type="date" value={form.date.slice(0,10)} onChange={(e)=> setForm((f:any)=>({ ...f, date: new Date(e.target.value).toISOString() }))} />
          <Input label="Due" error={errors.dueDate} type="date" value={form.dueDate?.slice(0,10) || ''} onChange={(e)=> setForm((f:any)=>({ ...f, dueDate: new Date(e.target.value).toISOString() }))} />
          <Input label="Category" value={form.category || ''} onChange={(e)=> setForm((f:any)=>({ ...f, category: e.target.value }))} />
          <Select label="Status" value={form.status} onValueChange={(v)=> setForm((f:any)=>({ ...f, status: v }))} options={[
            { label: 'Unpaid', value: 'unpaid' }, { label: 'Partial', value: 'partial' },
            { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }
          ]} />
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 text-sm font-medium">
            <div className="col-span-9">Description</div>
            <div className="col-span-3 text-right pr-2">Amount</div>
          </div>
          {form.lines.map((l:any, idx:number)=> (
            <div key={idx} className="grid grid-cols-12 gap-2 p-2 border-t">
              <div className="col-span-9"><Input value={l.description} onChange={(e)=> setLine(idx, { description: e.target.value })} /></div>
              <div className="col-span-3 flex gap-2">
                <Input className="flex-1" type="number" step="0.01" value={l.amount} onChange={(e)=> setLine(idx, { amount: e.target.value })} />
                <Button variant="ghost" onClick={()=> removeLine(idx)}>Remove</Button>
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
          <Button onClick={save}>Save Changes</Button>
          <Button variant="secondary" onClick={()=> router.push(`/purchases/${form.id}`)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}