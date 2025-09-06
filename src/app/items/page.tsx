// app/items/page.tsx
'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { SortHeader, applySort, SortState } from '@/components/ui/sort'
import ConfirmButton from '@/components/ui/confirm-button'

export default function ItemsPage() {
  const [items, setItems] = useState<any[]>([])
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortState<'sku' | 'name' | 'stock' | 'price'>>({ key: 'name', dir: 'asc' })

  const load = async () => setItems(await db.list('items'))
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => items.filter((i) =>
    [i.name, i.sku, i.category].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase())
  ), [items, q])

  const rows = useMemo(() => applySort(filtered, sort, {
    sku: (a: any, b: any) => (a.sku || '').localeCompare(b.sku || ''),
    name: (a: any, b: any) => (a.name || '').localeCompare(b.name || ''),
    stock: (a: any, b: any) => Number(a.stockQty || 0) - Number(b.stockQty || 0),
    price: (a: any, b: any) => Number(a.unitPrice || 0) - Number(b.unitPrice || 0),
  }), [filtered, sort])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Items</h1>
        <div className="flex gap-2">
          <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
          <Button asChild><Link href="/items/new">New Item</Link></Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <THead>
            <TR>
              <TH><SortHeader label="SKU" sortKey="sku" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Name" sortKey="name" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Stock" sortKey="stock" sort={sort} setSort={setSort} /></TH>
              <TH><SortHeader label="Price" sortKey="price" sort={sort} setSort={setSort} /></TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((i) => (
              <TR key={i.id}>
                <TD className="text-sm">{i.sku || '-'}</TD>
                <TD className="font-medium">{i.name}</TD>
                <TD>{i.stockQty || 0}</TD>
                <TD>{(Number(i.unitPrice || 0)).toFixed(2)}</TD>
                <TD>
                  <div className="flex gap-2">
                    <Button variant="secondary" asChild><Link href={`/items/${i.id}`}>Edit</Link></Button>
                    <ConfirmButton onConfirm={async () => { await db.remove('items', i.id); await load() }}>
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