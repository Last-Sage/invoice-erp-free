// src/app/purchases/page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import type { Purchase } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { useSettings } from '@/lib/settings-client'
import { SortHeader, applySort, type SortState } from '@/components/ui/sort'
import ConfirmButton from '@/components/ui/confirm-button'

export default function PurchasesPage() {
  const { settings } = useSettings()
  const currency = settings?.currency || 'USD'
  const [rows, setRows] = useState<Purchase[]>([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortState<'vendor' | 'date' | 'due' | 'status' | 'total'>>({ key: 'date', dir: 'desc' })

  const load = async () => setRows(await db.list('purchases'))
  useEffect(() => { void load() }, [])

  const filtered = useMemo(
    () => rows.filter((r) => [r.vendor, r.category, r.status, r.total].join(' ').toLowerCase().includes(q.toLowerCase())),
    [rows, q]
  )

  const data = useMemo(
    () => applySort(filtered, sort, {
      vendor: (a, b) => (a.vendor || '').localeCompare(b.vendor || ''),
      date: (a, b) => (a.date || '').localeCompare(b.date || ''),
      due: (a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''),
      status: (a, b) => (a.status || '').localeCompare(b.status || ''),
      total: (a, b) => Number(a.total || 0) - Number(b.total || 0),
    }),
    [filtered, sort]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Purchases / Expenses</h1>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button asChild><Link href="/purchases/new">New Purchase</Link></Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <THead>
            <TR>
              <TH><SortHeader label="Vendor" sortKey="vendor" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Date" sortKey="date" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Due" sortKey="due" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Status" sortKey="status" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Total" sortKey="total" sort={sort} setSort={setSort} /></TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {data.map((r) => (
              <TR key={r.id}>
                <TD className="font-medium">{r.vendor}</TD>
                <TD>{r.date?.slice(0, 10)}</TD>
                <TD>{r.dueDate?.slice(0, 10)}</TD>
                <TD><Badge variant={r.status === 'paid' ? 'success' : r.status === 'overdue' ? 'destructive' : 'secondary'}>{r.status}</Badge></TD>
                <TD>{formatCurrency(r.total || 0, currency)}</TD>
                <TD>
                  <div className="flex gap-2">
                    <Button variant="secondary" asChild><Link href={`/purchases/${r.id}`}>Open</Link></Button>
                    <ConfirmButton onConfirm={async () => { await db.remove('purchases', r.id); await load() }}>
                      Delete
                    </ConfirmButton>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </div>
  )
}