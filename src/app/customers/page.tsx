// app/customers/page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { SortHeader, applySort, SortState } from '@/components/ui/sort'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortState<'name'|'email'|'createdAt'>>({ key: 'name', dir: 'asc' })

  const load = async () => { const list = await db.list('customers'); setCustomers(list) }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => customers.filter((c) =>
    [c.name, c.email, c.phone].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())
  ), [customers, q])

  const rows = useMemo(() => applySort(filtered, sort, {
    name: (a:any,b:any)=> (a.name||'').localeCompare(b.name||''),
    email: (a:any,b:any)=> (a.email||'').localeCompare(b.email||''),
    createdAt: (a:any,b:any)=> (a.createdAt||'').localeCompare(b.createdAt||''),
  }), [filtered, sort])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Customers</h1>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button asChild><Link href="/customers/new">New Customer</Link></Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <THead>
            <TR>
              <TH><SortHeader label="Name" sortKey="name" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Contact" sortKey="email" sort={sort} setSort={setSort} /></TH>
              <TH>Billing</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium">{c.name}</TD>
                <TD className="text-sm text-muted-foreground">
                  {c.email || '-'} {c.phone ? `• ${c.phone}` : ''}
                </TD>
                <TD className="text-sm">{c.billingAddress?.line1 || '-'}</TD>
                <TD>
                  <div className="flex gap-2">
                    <Button variant="secondary" asChild><Link href={`/customers/${c.id}`}>View</Link></Button>
                    <Button variant="destructive" onClick={async () => { await db.remove('customers', c.id); load() }}>Delete</Button>
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