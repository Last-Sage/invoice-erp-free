// app/reports/sales/page.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import AreaChartCard from '@/components/charts/AreaChartCard'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'
import { SortHeader, applySort, SortState } from '@/components/ui/sort'

export default function SalesReportPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortState<'number'|'customer'|'date'|'total'>>({ key: 'date', dir: 'desc' })

  useEffect(() => { (async () => setInvoices(await db.list('invoices')))() }, [])

  const filtered = useMemo(() => invoices.filter((i) => !q || (i.customerName || '').toLowerCase().includes(q.toLowerCase())), [invoices, q])

  const data = useMemo(() => {
    const byMonth = new Map<string, number>()
    filtered.forEach((i) => {
      const key = (i.date || new Date().toISOString()).slice(0,7)
      byMonth.set(key, (byMonth.get(key) || 0) + (i.total || 0))
    })
    return Array.from(byMonth.entries()).map(([date, sales]) => ({ date, sales }))
  }, [filtered])

  const rows = useMemo(()=> applySort(filtered, sort, {
    number: (a:any,b:any)=> (a.number||'').localeCompare(b.number||''),
    customer: (a:any,b:any)=> (a.customerName||'').localeCompare(b.customerName||''),
    date: (a:any,b:any)=> (a.date||'').localeCompare(b.date||''),
    total: (a:any,b:any)=> Number(a.total||0) - Number(b.total||0),
  }), [filtered, sort])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sales Report</h1>
        <Input placeholder="Filter by customer..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <AreaChartCard title="Sales by Month" data={data} xKey="date" yKey="sales" color="#22c55e" />
      <div className="rounded-md border">
        <Table>
          <THead>
            <TR>
              <TH><SortHeader label="Invoice" sortKey="number" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Customer" sortKey="customer" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Date" sortKey="date" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Total" sortKey="total" sort={sort} setSort={setSort} /></TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((i) => (
              <TR key={i.id}>
                <TD>{i.number}</TD>
                <TD>{i.customerName}</TD>
                <TD>{i.date?.slice(0,10)}</TD>
                <TD>{formatCurrency(i.total || 0)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  )
}