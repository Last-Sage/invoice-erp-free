// lib/db.ts
import { openDB, IDBPDatabase } from 'idb'
import type { Settings } from './types'
import { uid } from './utils'

type Tables = 'settings' | 'customers' | 'items' | 'invoices' | 'purchases' | 'payments'
type Row = any

let _db: IDBPDatabase | null = null

async function getDB() {
  if (_db) return _db
  _db = await openDB('invoice-pro', 2, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('customers')) db.createObjectStore('customers', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('invoices')) db.createObjectStore('invoices', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('purchases')) db.createObjectStore('purchases', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('payments')) db.createObjectStore('payments', { keyPath: 'id' })
      if (oldVersion < 2 && !db.objectStoreNames.contains('deletes')) {
        const del = db.createObjectStore('deletes', { keyPath: 'key' }) // key = `${table}:${id}`
        // value: { key, table, id, deletedAt }
      }
    }
  })
  // default settings ensure
  const existing = await _db.get('settings', 'settings')
  const defaults: Settings = {
    id: 'settings', companyName: '', address: '', currency: 'USD', theme: 'system',
    invoiceTemplate: 'simple', invoicePrefix: 'INV-', invoiceCounter: 0, invoiceNumberWidth: 5
  }
  if (!existing) await _db.put('settings', defaults)
  return _db
}

async function list(table: Tables): Promise<Row[]> {
  const db = await getDB(); return await db.getAll(table)
}
async function get(table: Tables, id: string): Promise<Row | undefined> {
  const db = await getDB(); return await db.get(table, id)
}

function stamp(table: Tables, row: Row) {
  const now = new Date().toISOString()
  const tStamped = ['customers','items','invoices','purchases','payments','settings'].includes(table)
    ? { ...row, updatedAt: now, createdAt: row.createdAt || now }
    : row
  return tStamped
}

async function upsert(table: Tables, row: Row): Promise<Row> {
  const db = await getDB()
  const withId = row.id ? row : { ...row, id: uid() }
  const withTimestamps = stamp(table, withId)
  await db.put(table, withTimestamps)
  if (table === 'settings' && typeof window !== 'undefined') {
    localStorage.setItem('invoice-pro:settings', JSON.stringify(withTimestamps))
    window.dispatchEvent(new CustomEvent('settings:updated'))
  }
  return withTimestamps
}

async function remove(table: Tables, id: string) {
  const db = await getDB()
  await db.delete(table, id)
  await db.put('deletes', { key: `${table}:${id}`, table, id, deletedAt: new Date().toISOString() })
}

async function clear(table: Tables) { const db = await getDB(); await db.clear(table) }
async function bulkPut(table: Tables, rows: Row[]) {
  const db = await getDB()
  const tx = db.transaction(table, 'readwrite')
  for (const r of rows) await tx.store.put(stamp(table, r))
  await tx.done
}
async function listDeletes() { const db = await getDB(); return await db.getAll('deletes') }
async function clearDeletes(keys?: string[]) {
  const db = await getDB()
  if (!keys) return await db.clear('deletes')
  const tx = db.transaction('deletes', 'readwrite')
  for (const k of keys) await tx.store.delete(k)
  await tx.done
}

export const db = { list, get, upsert, remove, getDB, clear, bulkPut, listDeletes, clearDeletes }