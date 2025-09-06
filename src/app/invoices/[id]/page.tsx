// app/invoices/[id]/page.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Select } from '@/components/ui/select'
import { ConfirmDialog } from '@/components/ui/dialog'
import ConfirmButton from '@/components/ui/confirm-button'

export default function ViewInvoice() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any | null>(null)
  const [settings, setSettings] = useState<any | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (async () => {
      setInvoice(await db.get('invoices', id))
      setSettings(await db.get('settings', 'settings'))
    })()
  }, [id])
  if (!invoice) return <div>Loading…</div>

  const saveStatus = async (status: string) => {
    const updated = { ...invoice, status }
    await db.upsert('invoices', updated)
    // add payment record on transition to paid (simple heuristic)
    if (status === 'paid') {
      await db.upsert('payments', { type: 'in', invoiceId: invoice.id, date: new Date().toISOString(), amount: invoice.total, method: 'bank' })
    }
    setInvoice(updated)
  }

  const printPDF = () => window.print()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h1 className="text-xl font-semibold">Invoice {invoice.number}</h1>
        <div className="flex gap-2 items-center">
          <Select
            label="Status"
            value={invoice.status}
            onValueChange={(v) => saveStatus(v)}
            options={[
              { label: 'Draft', value: 'draft' }, { label: 'Sent', value: 'sent' },
              { label: 'Paid', value: 'paid' }, { label: 'Overdue', value: 'overdue' }, { label: 'Void', value: 'void' }
            ]}
          />
          <Button variant="secondary" onClick={printPDF}>Print / Export PDF</Button>
          <Button onClick={() => setEditOpen(true)}>Edit</Button>
          <ConfirmButton onConfirm={async () => { await db.remove('invoices', invoice.id); router.push('/invoices') }}>
            Delete
          </ConfirmButton>
        </div>
      </div>

      <ConfirmDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Invoice?"
        description="Editing a sent/paid invoice can cause accounting mismatches. Proceed carefully."
        confirmText="Proceed to Edit"
        onConfirm={() => router.push(`/invoices/${invoice.id}/edit`)}
      />

      <Card ref={printRef} className="print:shadow-none print:border-0">
        <CardHeader>
          <CardTitle>Invoice #{invoice.number}</CardTitle>
          <div className="text-sm text-muted-foreground">
            Date: {invoice.date?.slice(0, 10)} • Due: {invoice.dueDate?.slice(0, 10)} • Status: {invoice.status}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="font-semibold mb-1">From</div>
              {settings?.logoDataUrl && <img src={settings.logoDataUrl} alt="Logo" className="h-10 mb-2" />}
              <div>{settings?.companyName}</div>
              {settings?.address && <div className="text-sm text-muted-foreground">{settings.address}</div>}
              <div className="text-sm text-muted-foreground">{settings?.contactName}{settings?.contactEmail ? ` • ${settings.contactEmail}` : ''}{settings?.contactPhone ? ` • ${settings.contactPhone}` : ''}</div>
              {settings?.website && <div className="text-sm text-muted-foreground">{settings.website}</div>}
              {settings?.taxId && <div className="text-sm text-muted-foreground">Tax ID: {settings.taxId}</div>}
            </div>
            <div className="md:text-right">
              <div className="font-semibold mb-1">Bill To</div>
              <div>{invoice.customerName}</div>
              {invoice.customerTaxId && <div className="text-sm text-muted-foreground">Tax ID: {invoice.customerTaxId}</div>}
              <div className="mt-3 font-semibold">Total: {formatCurrency(invoice.total || 0)}</div>
              <div className="text-sm">Subtotal: {formatCurrency(invoice.subtotal || 0)} • Tax: {formatCurrency(invoice.taxTotal || 0)} • Discount: {formatCurrency(invoice.discount || 0)}</div>
            </div>
          </div>

          <div className="mt-4 rounded-md border overflow-hidden">
            <div className="grid grid-cols-12 bg-muted/50 px-3 py-2 text-sm font-medium">
              <div className="col-span-7">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-2">Unit Price</div>
              <div className="col-span-1 text-right pr-2">Amt</div>
            </div>
            {invoice.lines?.map((l: any, idx: number) => (
              <div key={idx} className="grid grid-cols-12 gap-2 p-2 border-t">
                <div className="col-span-7">{l.description}</div>
                <div className="col-span-2">{l.qty}</div>
                <div className="col-span-2">{formatCurrency(l.unitPrice)}</div>
                <div className="col-span-1 text-right pr-2">{formatCurrency(l.qty * l.unitPrice)}</div>
              </div>
            ))}
          </div>

          {invoice.notes && <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</div>}
        </CardContent>
      </Card>
    </div>
  )
}