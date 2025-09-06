// app/reports/bills/page.tsx
'use client'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import BarChartCard from '@/components/charts/BarChartCard'
import { formatCurrency } from '@/lib/utils'
import { SortHeader, applySort, SortState } from '@/components/ui/sort'

export default function BillsReportPage() {
  const [rows, setRows] = useState<any[]>([])
  const [sort, setSort] = useState<SortState<'vendor'|'due'|'status'|'total'>>({ key: 'due', dir: 'asc' })
  useEffect(() => { (async () => setRows(await db.list('purchases')))() }, [])

  const due = useMemo(() => rows.filter(r => r.status !== 'paid'), [rows])
  const paid = useMemo(() => rows.filter(r => r.status === 'paid'), [rows])

  const byMonth = (list: any[]) => {
    const map = new Map<string, number>()
    list.forEach((r) => {
      const key = (r.dueDate || r.date || new Date().toISOString()).slice(0,7)
      map.set(key, (map.get(key) || 0) + (r.total || 0))
    })
    return Array.from(map.entries()).map(([date, total]) => ({ date, total }))
  }

  const chartData = useMemo(() => {
    const dueSeries = byMonth(due).map(({ date, total }) => ({ date, due: total }))
    const paidSeries = byMonth(paid).map(({ date, total }) => ({ date, paid: total }))
    const merged = new Map<string, any>()
    ;[...dueSeries, ...paidSeries].forEach((e) => {
      const entry = merged.get(e.date) || { date: e.date, due: 0, paid: 0 }
      merged.set(e.date, { ...entry, ...e })
    })
    return Array.from(merged.values())
  }, [due, paid])

  const sorted = useMemo(()=> applySort(rows, sort, {
    vendor: (a:any,b:any)=> (a.vendor||'').localeCompare(b.vendor||''),
    due: (a:any,b:any)=> (a.dueDate||'').localeCompare(b.dueDate||''),
    status: (a:any,b:any)=> (a.status||'').localeCompare(b.status||''),
    total: (a:any,b:any)=> Number(a.total||0) - Number(b.total||0),
  }), [rows, sort])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Bills to Pay</h1>
      <BarChartCard title="Due vs Paid" data={chartData} xKey="date" bars={[
        { dataKey: 'due', fill: '#ef4444' },
        { dataKey: 'paid', fill: '#22c55e' },
      ]} />
      <div className="rounded-md border">
        <Table>
          <THead>
            <TR>
              <TH><SortHeader label="Vendor" sortKey="vendor" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Due" sortKey="due" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Status" sortKey="status" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Total" sortKey="total" sort={sort} setSort={setSort} /></TH>
            </TR>
          </THead>
          <TBody>
            {sorted.map((r) => (
              <TR key={r.id}>
                <TD>{r.vendor}</TD>
                <TD>{(r.dueDate || '').slice(0,10)}</TD>
                <TD>{r.status}</TD>
                <TD>{formatCurrency(r.total || 0)}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  )
}