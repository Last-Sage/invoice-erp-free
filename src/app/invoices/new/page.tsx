// app/invoices/new/page.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { consumeNextInvoiceNumber, previewNextInvoiceNumber } from '@/lib/numbering'

type Line = { id?: string; itemId?: string; description: string; qty: number | string; unitPrice: number | string; taxRate: number | string }

export default function NewInvoicePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<any[]>([])
  const [items, setItems] = useState<any[]>([])
  const [numberPreview, setNumberPreview] = useState<string>('')
  const [errors, setErrors] = useState<Record<string,string>>({})

  const [form, setForm] = useState<any>({
    number: '',
    customerId: '',
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: 'draft',
    lines: [] as Line[],
    discount: 0,
    notes: '',
  })

  useEffect(() => {
    (async () => {
      setCustomers(await db.list('customers'))
      setItems(await db.list('items'))
      const p = await previewNextInvoiceNumber()
      setNumberPreview(p)
    })()
  }, [])

  const addLine = () => setForm((f: any) => ({ ...f, lines: [...f.lines, { description: '', qty: 1, unitPrice: 0, taxRate: 0 }] }))
  const setLine = (idx: number, patch: Partial<Line>) => setForm((f: any) => ({ ...f, lines: f.lines.map((l: Line, i: number) => i === idx ? { ...l, ...patch } : l) }))
  const removeLine = (idx: number) => setForm((f: any) => ({ ...f, lines: f.lines.filter((_: any, i: number) => i !== idx) }))

  const totals = useMemo(() => {
    const subtotal = form.lines.reduce((s: number, l: Line) => s + Number(l.qty || 0) * Number(l.unitPrice || 0), 0)
    const taxTotal = form.lines.reduce((s: number, l: Line) => s + (Number(l.qty || 0) * Number(l.unitPrice || 0)) * (Number(l.taxRate || 0) / 100), 0)
    const discount = Number(form.discount || 0)
    const total = Math.max(0, subtotal + taxTotal - discount)
    return { subtotal, taxTotal, discount, total }
  }, [form.lines, form.discount])

  const selectedCustomer = customers.find((c) => c.id === form.customerId)

  const validate = () => {
    const e: Record<string,string> = {}
    if (!form.customerId) e.customerId = 'Customer is required'
    if (!form.date) e.date = 'Date is required'
    if (!form.dueDate) e.dueDate = 'Due date is required'
    if (new Date(form.dueDate) < new Date(form.date)) e.dueDate = 'Due date cannot be earlier than invoice date'
    if (!form.lines.length) e.lines = 'Add at least one line item'
    form.lines.forEach((l: any, idx: number) => {
      if (!l.description?.trim()) e[`line_${idx}_description`] = 'Description required'
      if (Number(l.qty) <= 0) e[`line_${idx}_qty`] = 'Qty must be > 0'
      if (Number(l.unitPrice) < 0) e[`line_${idx}_unitPrice`] = 'Unit price must be ≥ 0'
      if (Number(l.taxRate) < 0) e[`line_${idx}_taxRate`] = 'Tax must be ≥ 0'
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    const number = form.number?.trim() ? form.number.trim() : await consumeNextInvoiceNumber()
    const payload = {
      ...form,
      number,
      customerName: selectedCustomer?.name,
      customerTaxId: selectedCustomer?.taxId || '',
      subtotal: totals.subtotal, taxTotal: totals.taxTotal, discount: totals.discount, total: totals.total,
      // normalize numeric fields
      lines: form.lines.map((l: any) => ({
        ...l,
        qty: Number(l.qty || 0),
        unitPrice: Number(l.unitPrice || 0),
        taxRate: Number(l.taxRate || 0),
      })),
    }
    const saved = await db.upsert('invoices', payload)
    router.push(`/invoices/${saved.id}`)
  }

  return (
    <Card className="max-w-5xl">
      <CardHeader><CardTitle>New Invoice</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-5 gap-4">
  <Input label="Invoice No." value={form.number} onChange={(e) => setForm((f: any) => ({ ...f, number: e.target.value }))} error={errors.number} />
  <Select label="Customer" value={form.customerId} onValueChange={(v) => setForm((f: any) => ({ ...f, customerId: v }))} options={[{ label: 'Select...', value: '' }, ...customers.map(c => ({ label: c.name, value: c.id }))]} error={errors.customerId} />
  <Input label="Date" type="date" value={form.date.slice(0,10)} onChange={(e) => setForm((f: any) => ({ ...f, date: new Date(e.target.value).toISOString() }))} error={errors.date} />
  <Input label="Due" type="date" value={form.dueDate.slice(0,10)} onChange={(e) => setForm((f: any) => ({ ...f, dueDate: new Date(e.target.value).toISOString() }))} error={errors.dueDate} />
  <Select label="Status" value={form.status} onValueChange={(v)=> setForm((f:any)=>({ ...f, status: v }))} options={[
    { label: 'Draft', value: 'draft' }, { label: 'Sent', value: 'sent' }, { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }
  ]} />
</div>

        {errors.lines && <div className="text-sm text-red-600">{errors.lines}</div>}

        <div className="rounded-md border overflow-hidden">
          <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 text-sm font-medium">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-2">Tax %</div>
            <div className="col-span-1 text-right pr-2">Amt</div>
          </div>
          {form.lines.map((l: Line, idx: number) => (
            <div key={idx} className="grid grid-cols-12 gap-2 p-2 border-t">
              <div className="col-span-5">
                <Input placeholder="Description" error={errors[`line_${idx}_description`]} value={l.description} onChange={(e) => setLine(idx, { description: e.target.value })} />
                <div className="text-xs text-muted-foreground mt-1">
                  <select
                    className="border rounded px-2 py-1 text-xs bg-background"
                    onChange={(e) => {
                      const item = items.find((it) => it.id === e.target.value)
                      if (item) setLine(idx, { itemId: item.id, description: item.name, unitPrice: item.unitPrice, taxRate: item.taxRate || 0 })
                    }}
                  >
                    <option value="">Add from items…</option>
                    {items.map((it) => <option key={it.id} value={it.id}>{it.sku ? `${it.sku} — ` : ''}{it.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="col-span-2"><Input type="number" error={errors[`line_${idx}_qty`]} value={l.qty} onChange={(e) => setLine(idx, { qty: e.target.value })} /></div>
              <div className="col-span-2"><Input type="number" error={errors[`line_${idx}_unitPrice`]} step="0.01" value={l.unitPrice} onChange={(e) => setLine(idx, { unitPrice: e.target.value })} /></div>
              <div className="col-span-2"><Input type="number" error={errors[`line_${idx}_taxRate`]} step="0.01" value={l.taxRate} onChange={(e) => setLine(idx, { taxRate: e.target.value })} /></div>
              <div className="col-span-1 text-right pr-2 self-center">{formatCurrency(Number(l.qty || 0) * Number(l.unitPrice || 0))}</div>
              <div className="col-span-12 flex justify-end">
                <Button variant="ghost" onClick={() => removeLine(idx)}>Remove</Button>
              </div>
            </div>
          ))}
          <div className="p-2 border-t">
            <Button variant="secondary" onClick={addLine}>+ Add Line</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input label="Discount" type="number" step="0.01" value={form.discount} onChange={(e) => setForm((f: any) => ({ ...f, discount: Number(e.target.value) }))} />
            <textarea
              className="w-full mt-3 border rounded-md p-2 bg-background"
              rows={3}
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm((f: any) => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="border rounded-md p-3 space-y-2">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>{formatCurrency(totals.taxTotal)}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>-{formatCurrency(totals.discount)}</span></div>
            <div className="flex justify-between border-t pt-2 font-semibold"><span>Total</span><span>{formatCurrency(totals.total)}</span></div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={save}>Save Invoice</Button>
        </div>
      </CardContent>
    </Card>
  )
}