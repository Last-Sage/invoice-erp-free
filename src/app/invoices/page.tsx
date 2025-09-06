// src/app/invoices/page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import type { Invoice } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useSettings } from '@/lib/settings-client'
import { SortHeader, applySort, type SortState } from '@/components/ui/sort'
import ConfirmButton from '@/components/ui/confirm-button'

export default function InvoicesPage() {
  const { settings } = useSettings()
  const currency = settings?.currency || 'USD'
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortState<'number' | 'customer' | 'date' | 'due' | 'status' | 'total'>>({ key: 'date', dir: 'desc' })

  const load = async () => setInvoices(await db.list('invoices'))
  useEffect(() => { void load() }, [])

  const filtered = useMemo(
    () => invoices.filter((i) => [i.number, i.status, i.customerName, i.total].join(' ').toLowerCase().includes(q.toLowerCase())),
    [invoices, q]
  )

  const rows = useMemo(
    () => applySort(filtered, sort, {
      number: (a, b) => (a.number || '').localeCompare(b.number || ''),
      customer: (a, b) => (a.customerName || '').localeCompare(b.customerName || ''),
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
        <h1 className="text-xl font-semibold">Invoices</h1>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button asChild><Link href="/invoices/new">New Invoice</Link></Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <THead>
            <TR>
              <TH><SortHeader label="No." sortKey="number" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Customer" sortKey="customer" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Date" sortKey="date" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Due" sortKey="due" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Status" sortKey="status" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Total" sortKey="total" sort={sort} setSort={setSort} /></TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((i) => (
              <TR key={i.id}>
                <TD className="font-medium">{i.number}</TD>
                <TD>{i.customerName || '-'}</TD>
                <TD>{i.date?.slice(0, 10)}</TD>
                <TD>{i.dueDate?.slice(0, 10)}</TD>
                <TD><Badge variant={i.status === 'paid' ? 'success' : i.status === 'overdue' ? 'destructive' : 'secondary'}>{i.status}</Badge></TD>
                <TD>{formatCurrency(i.total || 0, currency)}</TD>
                <TD>
                  <div className="flex gap-2">
                    <Button variant="secondary" asChild><Link href={`/invoices/${i.id}`}>Open</Link></Button>
                    <ConfirmButton
                      onConfirm={async () => { await db.remove('invoices', i.id); await load() }}
                    >
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