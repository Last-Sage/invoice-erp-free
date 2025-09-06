// app/purchases/page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export default function PurchasesPage() {
  const [rows, setRows] = useState<any[]>([])
  const [q, setQ] = useState('')
  const load = async () => setRows(await db.list('purchases'))
  useEffect(() => { load() }, [])

  const filtered = rows.filter((r) => [r.vendor, r.category, r.status, r.total].join(' ').toLowerCase().includes(q.toLowerCase()))

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
            <TR><TH>Vendor</TH><TH>Date</TH><TH>Due</TH><TH>Status</TH><TH>Total</TH><TH>Actions</TH></TR>
          </THead>
          <TBody>
            {filtered.map((r) => (
              <TR key={r.id}>
                <TD className="font-medium">{r.vendor}</TD>
                <TD>{r.date?.slice(0,10)}</TD>
                <TD>{r.dueDate?.slice(0,10)}</TD>
                <TD><Badge variant={r.status === 'paid' ? 'success' : r.status === 'overdue' ? 'destructive' : 'secondary'}>{r.status}</Badge></TD>
                <TD>{formatCurrency(r.total || 0)}</TD>
                <TD>
                  <div className="flex gap-2">
                    <Button variant="secondary" asChild><Link href={`/purchases/${r.id}`}>Open</Link></Button>
                    <Button variant="destructive" onClick={async () => { await db.remove('purchases', r.id); load() }}>Delete</Button>
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