// app/reports/payments/page.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { SortHeader, applySort, SortState } from '@/components/ui/sort'

export default function PaymentsReportPage() {
  const [rows, setRows] = useState<any[]>([])
  const [sort, setSort] = useState<SortState<'date'|'type'|'amount'|'ref'>>({ key: 'date', dir: 'desc' })
  useEffect(() => { (async () => setRows(await db.list('payments')))() }, [])
  const totals = useMemo(() => ({
    received: rows.filter((r) => r.type === 'in').reduce((s, r) => s + (r.amount || 0), 0),
    paid: rows.filter((r) => r.type === 'out').reduce((s, r) => s + (r.amount || 0), 0),
  }), [rows])

  const sorted = useMemo(()=> applySort(rows, sort, {
    date: (a:any,b:any)=> (a.date||'').localeCompare(b.date||''),
    type: (a:any,b:any)=> (a.type||'').localeCompare(b.type||''),
    amount: (a:any,b:any)=> Number(a.amount||0) - Number(b.amount||0),
    ref: (a:any,b:any)=> ((a.invoiceId||a.purchaseId||'') as string).localeCompare((b.invoiceId||b.purchaseId||'') as string),
  }), [rows, sort])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Payments</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded-md p-3">
          <div className="text-sm text-muted-foreground">Payments Received</div>
          <div className="text-xl font-semibold">{formatCurrency(totals.received)}</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="text-sm text-muted-foreground">Payments Paid</div>
          <div className="text-xl font-semibold">{formatCurrency(totals.paid)}</div>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <THead>
            <TR>
              <TH><SortHeader label="Date" sortKey="date" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Type" sortKey="type" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Amount" sortKey="amount" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Ref" sortKey="ref" sort={sort} setSort={setSort} /></TH>
            </TR>
          </THead>
          <TBody>
            {sorted.map((r) => (
              <TR key={r.id}>
                <TD>{(r.date || '').slice(0,10)}</TD>
                <TD>{r.type}</TD>
                <TD>{formatCurrency(r.amount || 0)}</TD>
                <TD className="text-xs text-muted-foreground">{r.invoiceId || r.purchaseId || '-'}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  )
}