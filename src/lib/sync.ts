// lib/sync.ts
'use client'
import { supabase } from './supabase/client'
import { db } from './db'

const TABLES = ['customers','items','invoices','purchases','payments'] as const
type Table = typeof TABLES[number]
const LAST = (userId: string, table: Table) => `sync:last:${userId}:${table}`

const toDate = (d?: string) => (d ? new Date(d).toISOString().slice(0,10) : null)

function toRemote(table: Table, row: any, userId: string) {
  const base = { id: row.id, user_id: userId, created_at: row.createdAt ?? null, updated_at: row.updatedAt ?? null }
  switch (table) {
    case 'customers':
      return {
        ...base,
        name: row.name,
        email: row.email ?? null,
        phone: row.phone ?? null,
        billing_address: row.billingAddress ?? null,
        shipping_address: row.shippingAddress ?? null,
        tax_id: row.taxId ?? null,
        notes: row.notes ?? null,
      }
    case 'items':
      return {
        ...base,
        sku: row.sku ?? null,
        name: row.name,
        description: row.description ?? null,
        stock_qty: Number(row.stockQty ?? 0),
        unit_price: Number(row.unitPrice ?? 0),
        purchase_price: row.purchasePrice == null ? null : Number(row.purchasePrice),
        tax_rate: row.taxRate == null ? null : Number(row.taxRate),
        category: row.category ?? null,
      }
    case 'invoices':
      return {
        ...base,
        number: row.number,
        customer_id: row.customerId ?? null,
        customer_name: row.customerName ?? null,
        customer_tax_id: row.customerTaxId ?? null,
        date: toDate(row.date),
        due_date: toDate(row.dueDate),
        status: row.status ?? 'draft',
        lines: row.lines ?? [],
        subtotal: Number(row.subtotal ?? 0),
        tax_total: Number(row.taxTotal ?? 0),
        discount: Number(row.discount ?? 0),
        total: Number(row.total ?? 0),
        notes: row.notes ?? null,
      }
    case 'purchases':
      return {
        ...base,
        vendor: row.vendor,
        date: toDate(row.date),
        due_date: toDate(row.dueDate),
        category: row.category ?? null,
        lines: row.lines ?? [],
        total: Number(row.total ?? 0),
        status: row.status ?? 'unpaid',
        notes: row.notes ?? null,
      }
    case 'payments':
      return {
        ...base,
        date: toDate(row.date),
        type: row.type,
        amount: Number(row.amount ?? 0),
        method: row.method ?? null,
        invoice_id: row.invoiceId ?? null,
        purchase_id: row.purchaseId ?? null,
      }
  }
}

function fromRemote(table: Table, row: any) {
  const base = { id: row.id, createdAt: row.created_at ?? null, updatedAt: row.updated_at ?? null }
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
      }
    case 'items':
      return {
        ...base,
        sku: row.sku ?? undefined,
        name: row.name,
        description: row.description ?? undefined,
        stockQty: Number(row.stock_qty ?? 0),
        unitPrice: Number(row.unit_price ?? 0),
        purchasePrice: row.purchase_price == null ? undefined : Number(row.purchase_price),
        taxRate: row.tax_rate == null ? undefined : Number(row.tax_rate),
        category: row.category ?? undefined,
      }
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
        subtotal: Number(row.subtotal ?? 0),
        taxTotal: Number(row.tax_total ?? 0),
        discount: Number(row.discount ?? 0),
        total: Number(row.total ?? 0),
        notes: row.notes ?? undefined,
      }
    case 'purchases':
      return {
        ...base,
        vendor: row.vendor,
        date: row.date ? new Date(row.date).toISOString() : undefined,
        dueDate: row.due_date ? new Date(row.due_date).toISOString() : undefined,
        category: row.category ?? undefined,
        lines: row.lines ?? [],
        total: Number(row.total ?? 0),
        status: row.status,
        notes: row.notes ?? undefined,
      }
    case 'payments':
      return {
        ...base,
        date: row.date ? new Date(row.date).toISOString() : undefined,
        type: row.type,
        amount: Number(row.amount ?? 0),
        method: row.method ?? undefined,
        invoiceId: row.invoice_id ?? undefined,
        purchaseId: row.purchase_id ?? undefined,
      }
  }
}

function getLast(userId: string, table: Table) {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(LAST(userId, table))
}
function setLast(userId: string, table: Table, iso: string) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(LAST(userId, table), iso)
}

export async function syncNow(userId: string) {
  const now = new Date().toISOString()

  // Push deletes first (tombstones)
  const deletes = await db.listDeletes()
  const toDelete = deletes.filter((d: any) => (TABLES as readonly string[]).includes(d.table))
  for (const d of toDelete) {
    await supabase.from(d.table).delete().eq('id', d.id) // RLS ensures user owns row
  }
  if (toDelete.length) await db.clearDeletes(toDelete.map((d: any) => d.key))

  // Push local upserts (LWW via updatedAt)
  for (const table of TABLES) {
    const last = getLast(userId, table)
    const rows: any[] = await db.list(table as any)
    const changed = last ? rows.filter(r => (r.updatedAt || r.createdAt || '') > last) : rows
    if (changed.length) {
      const payload = changed.map(r => toRemote(table, r, userId))
      const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' })
      if (error) console.error('push error', table, error)
    }
  }

  // Pull remote changes since last
  for (const table of TABLES) {
    const last = getLast(userId, table)
    const q = last
      ? supabase.from(table).select('*').gt('updated_at', last).order('updated_at', { ascending: true })
      : supabase.from(table).select('*').order('updated_at', { ascending: true })
    const { data, error } = await q
    if (error) { console.error('pull error', table, error); continue }
    if (data && data.length) {
      const mapped = data.map((r: any) => fromRemote(table, r))
      await db.bulkPut(table as any, mapped)
      setLast(userId, table, data[data.length - 1].updated_at)
    } else if (!last) {
      setLast(userId, table, now)
    }
  }
}

// Online event trigger
export function initOnlineSync(userId?: string) {
  if (!userId) return
  const handler = async () => {
    if (navigator.onLine) {
      try { await syncNow(userId) } catch (e) { /* ignore */ }
    }
  }
  window.addEventListener('online', handler)
  return () => window.removeEventListener('online', handler)
}

// Background interval sync (toggle-able)
const SYNC_AUTO = 'sync:auto'
const SYNC_INTERVAL = 'sync:interval' // ms
export function getSyncPrefs() {
  const auto = (localStorage.getItem(SYNC_AUTO) ?? 'true') === 'true'
  const interval = Number(localStorage.getItem(SYNC_INTERVAL) ?? 120000) // 2m
  return { auto, interval }
}
export function setSyncPrefs({ auto, interval }: { auto?: boolean; interval?: number }) {
  if (auto != null) localStorage.setItem(SYNC_AUTO, String(auto))
  if (interval != null) localStorage.setItem(SYNC_INTERVAL, String(interval))
}

export function initBackgroundSync(userId?: string) {
  if (!userId) return () => {}
  let { auto, interval } = getSyncPrefs()
  let timer: any = null

  const start = () => {
    if (!auto) return
    clearInterval(timer)
    timer = setInterval(async () => {
      if (!navigator.onLine) return
      try { await syncNow(userId) } catch {}
    }, interval)
  }

  start()
  const onStorage = (e: StorageEvent) => {
    if (e.key === SYNC_AUTO || e.key === SYNC_INTERVAL) {
      ({ auto, interval } = getSyncPrefs())
      start()
    }
  }
  window.addEventListener('storage', onStorage)
  return () => { clearInterval(timer); window.removeEventListener('storage', onStorage) }
}