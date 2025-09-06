// lib/db.ts
import { openDB, IDBPDatabase } from 'idb'
import type { Settings } from './types'
import { uid } from './utils'

type Tables = 'settings' | 'customers' | 'items' | 'invoices' | 'purchases' | 'payments'
type Row = any

let _db: IDBPDatabase | null = null

async function getDB() {
  if (_db) return _db
  _db = await openDB('invoice-pro', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('customers')) db.createObjectStore('customers', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('invoices')) db.createObjectStore('invoices', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('purchases')) db.createObjectStore('purchases', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('payments')) db.createObjectStore('payments', { keyPath: 'id' })
    }
  })
  // seed default settings if missing
  const s = await (_db as IDBPDatabase).get('settings', 'settings')
  if (!s) {
    const defaults: Settings = {
      id: 'settings',
      companyName: '',
      address: '',
      currency: 'USD',
      theme: 'system',
      invoiceTemplate: 'simple',
      invoicePrefix: '',
      invoiceCounter: 0,
      invoiceNumberWidth: 5,
    }
    await (_db as IDBPDatabase).put('settings', defaults)
    if (typeof window !== 'undefined') localStorage.setItem('invoice-pro:settings', JSON.stringify(defaults))
  } else {
    // ensure counters exist
    const patched = {
      ...s,
      invoicePrefix: s.invoicePrefix ?? '',
      invoiceCounter: s.invoiceCounter ?? 0,
      invoiceNumberWidth: s.invoiceNumberWidth ?? 5,
    }
    if (JSON.stringify(patched) !== JSON.stringify(s)) {
      await (_db as IDBPDatabase).put('settings', patched)
    }
    if (typeof window !== 'undefined') localStorage.setItem('invoice-pro:settings', JSON.stringify(patched))
  }
  return _db
}

async function list(table: Tables): Promise<Row[]> {
  const db = await getDB()
  return (await db.getAll(table)) as any
}

async function get(table: Tables, id: string): Promise<Row | undefined> {
  const db = await getDB()
  return (await db.get(table, id)) as any
}

async function upsert(table: Tables, row: Row): Promise<Row> {
  const db = await getDB()
  const now = new Date().toISOString()
  const withId = row.id ? row : { ...row, id: uid() }
  const withTimestamps = ['customers', 'items'].includes(table)
    ? { ...withId, updatedAt: now, createdAt: withId.createdAt || now }
    : withId
  await db.put(table, withTimestamps)
  // keep settings in localStorage for instant currency/theme consumption
  if (table === 'settings' && typeof window !== 'undefined') {
    localStorage.setItem('invoice-pro:settings', JSON.stringify(withTimestamps))
    window.dispatchEvent(new CustomEvent('settings:updated'))
  }
  return withTimestamps
}

async function remove(table: Tables, id: string) {
  const db = await getDB()
  await db.delete(table, id)
}

async function getSettings(): Promise<Settings> {
  return (await get('settings', 'settings')) as Settings
}

export const db = { list, get, upsert, remove, getDB, getSettings }