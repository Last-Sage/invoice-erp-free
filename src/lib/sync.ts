// src/lib/sync.ts
'use client'

import { supabase } from '@/lib/supabase/client'
import type { Address, Customer, Item, Invoice, InvoiceLine, Purchase, Payment } from '@/lib/types'
import { db, type TableName, type TableRowMap } from '@/lib/db'

const TABLES = ['customers', 'items', 'invoices', 'purchases', 'payments'] as const
type Table = typeof TABLES[number]

const LAST = (userId: string, table: Table) => `sync:last:${userId}:${table}`
const toDate = (d?: string) => (d ? new Date(d).toISOString().slice(0, 10) : null)

type RemoteBase = { id: string; user_id: string; created_at: string | null; updated_at: string | null }
type RemoteCustomer = RemoteBase & {
  name: string; email: string | null; phone: string | null;
  billing_address: Address | null; shipping_address: Address | null;
  tax_id: string | null; notes: string | null;
}
type RemoteItem = RemoteBase & {
  sku: string | null; name: string; description: string | null;
  stock_qty: number | null; unit_price: number; purchase_price: number | null;
  tax_rate: number | null; category: string | null;
}
type RemoteInvoice = RemoteBase & {
  number: string; customer_id: string | null; customer_name: string | null; customer_tax_id: string | null;
  date: string | null; due_date: string | null; status: Invoice['status'];
  lines: InvoiceLine[]; subtotal: number | null; tax_total: number | null; discount: number | null; total: number | null;
  notes: string | null;
}
type RemotePurchase = RemoteBase & {
  vendor: string; date: string | null; due_date: string | null;
  category: string | null; lines: Purchase['lines']; total: number | null; status: Purchase['status']; notes: string | null;
}
type RemotePayment = RemoteBase & {
  date: string | null; type: Payment['type']; amount: number; method: string | null;
  invoice_id: string | null; purchase_id: string | null;
}

type RemoteMap = {
  customers: RemoteCustomer
  items: RemoteItem
  invoices: RemoteInvoice
  purchases: RemotePurchase
  payments: RemotePayment
}

function toRemote(table: 'customers', row: Customer, userId: string): RemoteCustomer
function toRemote(table: 'items', row: Item, userId: string): RemoteItem
function toRemote(table: 'invoices', row: Invoice, userId: string): RemoteInvoice
function toRemote(table: 'purchases', row: Purchase, userId: string): RemotePurchase
function toRemote(table: 'payments', row: Payment, userId: string): RemotePayment
function toRemote(table: Table, row: TableRowMap[Table], userId: string): RemoteMap[Table] {
  const base: RemoteBase = {
    id: (row as any).id,
    user_id: userId,
    created_at: (row as any).createdAt ?? null,
    updated_at: (row as any).updatedAt ?? null
  }
  switch (table) {
    case 'customers': {
      const r = row as Customer
      return {
        ...base,
        name: r.name,
        email: r.email ?? null,
        phone: r.phone ?? null,
        billing_address: r.billingAddress ?? null,
        shipping_address: r.shippingAddress ?? null,
        tax_id: r.taxId ?? null,
        notes: r.notes ?? null,
      }
    }
    case 'items': {
      const r = row as Item
      return {
        ...base,
        sku: r.sku ?? null,
        name: r.name,
        description: r.description ?? null,
        stock_qty: r.stockQty ?? null,
        unit_price: r.unitPrice,
        purchase_price: r.purchasePrice ?? null,
        tax_rate: r.taxRate ?? null,
        category: r.category ?? null,
      }
    }
    case 'invoices': {
      const r = row as Invoice
      return {
        ...base,
        number: r.number,
        customer_id: r.customerId ?? null,
        customer_name: r.customerName ?? null,
        customer_tax_id: r.customerTaxId ?? null,
        date: toDate(r.date),
        due_date: toDate(r.dueDate),
        status: r.status,
        lines: r.lines ?? [],
        subtotal: r.subtotal ?? 0,
        tax_total: r.taxTotal ?? 0,
        discount: r.discount ?? 0,
        total: r.total ?? 0,
        notes: r.notes ?? null,
      }
    }
    case 'purchases': {
      const r = row as Purchase
      return {
        ...base,
        vendor: r.vendor,
        date: toDate(r.date),
        due_date: toDate(r.dueDate),
        category: r.category ?? null,
        lines: r.lines ?? [],
        total: r.total ?? 0,
        status: r.status,
        notes: r.notes ?? null,
      }
    }
    case 'payments': {
      const r = row as Payment
      return {
        ...base,
        date: toDate(r.date),
        type: r.type,
        amount: r.amount,
        method: r.method ?? null,
        invoice_id: r.invoiceId ?? null,
        purchase_id: r.purchaseId ?? null,
      }
    }
  }
}

function fromRemote(table: 'customers', row: RemoteCustomer): Customer
function fromRemote(table: 'items', row: RemoteItem): Item
function fromRemote(table: 'invoices', row: RemoteInvoice): Invoice
function fromRemote(table: 'purchases', row: RemotePurchase): Purchase
function fromRemote(table: 'payments', row: RemotePayment): Payment
function fromRemote(table: Table, row: RemoteMap[Table]): TableRowMap[Table] {
  const base = { id: row.id, createdAt: row.created_at ?? undefined, updatedAt: row.updated_at ?? undefined }
  switch (table) {
    case 'customers':
      return {
        ...base,
        name: row.name,
        email: row.email ?? undefined,
        phone: row.phone ?? undefined,
        billingAddress: row.billing_address ?? undefined,
        shippingAddress: row.shipping_address ?? undefined,
        taxId: row.tax_id ?? undefined,
        notes: row.notes ?? undefined,
      } as Customer
    case 'items':
      return {
        ...base,
        sku: row.sku ?? undefined,
        name: row.name,
        description: row.description ?? undefined,
        stockQty: row.stock_qty ?? undefined,
        unitPrice: row.unit_price,
        purchasePrice: row.purchase_price ?? undefined,
        taxRate: row.tax_rate ?? undefined,
        category: row.category ?? undefined,
      } as Item
    case 'invoices':
      return {
        ...base,
        number: row.number,
        customerId: row.customer_id ?? undefined,
        customerName: row.customer_name ?? undefined,
        customerTaxId: row.customer_tax_id ?? undefined,
        date: row.date ? new Date(row.date).toISOString() : undefined,
        dueDate: row.due_date ? new Date(row.due_date).toISOString() : undefined,
        status: row.status,
        lines: row.lines ?? [],
        subtotal: row.subtotal ?? undefined,
        taxTotal: row.tax_total ?? undefined,
        discount: row.discount ?? undefined,
        total: row.total ?? undefined,
        notes: row.notes ?? undefined,
      } as Invoice
    case 'purchases':
      return {
        ...base,
        vendor: row.vendor,
        date: row.date ? new Date(row.date).toISOString() : undefined,
        dueDate: row.due_date ? new Date(row.due_date).toISOString() : undefined,
        category: row.category ?? undefined,
        lines: row.lines ?? [],
        total: row.total ?? 0,
        status: row.status,
        notes: row.notes ?? undefined,
      } as Purchase
    case 'payments':
      return {
        ...base,
        date: row.date ? new Date(row.date).toISOString() : undefined,
        type: row.type,
        amount: row.amount,
        method: row.method ?? undefined,
        invoiceId: row.invoice_id ?? undefined,
        purchaseId: row.purchase_id ?? undefined,
      } as Payment
  }
}

function getLast(userId: string, table: Table): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(LAST(userId, table))
}
function setLast(userId: string, table: Table, iso: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(LAST(userId, table), iso)
}

export async function syncNow(userId: string): Promise<void> {
  const now = new Date().toISOString()

  // Push deletes...
  const deletes = await db.listDeletes()
  const toDelete = deletes.filter((d) => ['customers','items','invoices','purchases','payments'].includes(d.table))
  for (const d of toDelete) {
    await supabase.from(d.table).delete().eq('id', d.id)
  }
  if (toDelete.length) await db.clearDeletes(toDelete.map((d) => d.key))

  // Push local upserts...
  for (const table of ['customers','items','invoices','purchases','payments'] as const) {
    const last = typeof localStorage !== 'undefined' ? localStorage.getItem(`sync:last:${userId}:${table}`) : null
    const rows = await db.list(table)
    const changed = last ? rows.filter((r: any) => ((r.updatedAt || r.createdAt || '') > last)) : rows
    if (changed.length) {
      const payload = changed.map((r) => toRemote(table, r as any, userId))
      await supabase.from(table).upsert(payload, { onConflict: 'id' })
    }
  }

  // Pull remote...
  for (const table of ['customers','items','invoices','purchases','payments'] as const) {
    const key = `sync:last:${userId}:${table}`
    const last = typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    const q = last
      ? supabase.from(table).select('*').gt('updated_at', last).order('updated_at', { ascending: true })
      : supabase.from(table).select('*').order('updated_at', { ascending: true })
    const { data } = await q
    if (data && data.length) {
      const mapped = data.map((r: any) => fromRemote(table, r))
      await db.bulkPut(table, mapped as any)
      const lastStamp = (data[data.length - 1] as any).updated_at || now
      localStorage.setItem(key, lastStamp)
    } else if (!last) {
      localStorage.setItem(key, now)
    }
  }

  // Broadcast sync completion so pages refresh
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sync:complete'))
  }
}
export function initOnlineSync(userId?: string): () => void {
  if (!userId) return () => {}
  const handler = () => { if (navigator.onLine) void syncNow(userId) }
  window.addEventListener('online', handler)
  return () => window.removeEventListener('online', handler)
}

const SYNC_AUTO = 'sync:auto'
const SYNC_INTERVAL = 'sync:interval'
export function getSyncPrefs(): { auto: boolean; interval: number } {
  const auto = (localStorage.getItem(SYNC_AUTO) ?? 'true') === 'true'
  const interval = Number(localStorage.getItem(SYNC_INTERVAL) ?? 120000)
  return { auto, interval }
}
export function setSyncPrefs({ auto, interval }: { auto?: boolean; interval?: number }): void {
  if (auto != null) localStorage.setItem(SYNC_AUTO, String(auto))
  if (interval != null) localStorage.setItem(SYNC_INTERVAL, String(interval))
}
export function initBackgroundSync(userId?: string): () => void {
  if (!userId) return () => {}
  let { auto, interval } = getSyncPrefs()
  let timer: number | null = null
  const start = () => {
    if (!auto) return
    if (timer) window.clearInterval(timer)
    timer = window.setInterval(() => { if (navigator.onLine) void syncNow(userId) }, interval)
  }
  start()
  const onStorage = (e: StorageEvent) => {
    if (e.key === SYNC_AUTO || e.key === SYNC_INTERVAL) { ({ auto, interval } = getSyncPrefs()); start() }
  }
  window.addEventListener('storage', onStorage)
  return () => { if (timer) window.clearInterval(timer); window.removeEventListener('storage', onStorage) }
}