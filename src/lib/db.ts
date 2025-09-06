// src/lib/db.ts
import { openDB, IDBPDatabase } from 'idb'
import type { ID, Settings, Customer, Item, Invoice, Purchase, Payment } from '@/lib/types'
import { uid } from '@/lib/utils'

export type TableName = 'settings' | 'customers' | 'items' | 'invoices' | 'purchases' | 'payments' | 'deletes'

export type DeleteRow = {
  key: string
  table: Exclude<TableName, 'settings' | 'deletes'>
  id: ID
  deletedAt: string
}

export type TableRowMap = {
  settings: Settings
  customers: Customer
  items: Item
  invoices: Invoice
  purchases: Purchase
  payments: Payment
  deletes: DeleteRow
}

export type UpsertRow<T extends Exclude<TableName, 'deletes'>> =
  Omit<TableRowMap[T], 'createdAt' | 'updatedAt'> &
  Partial<Pick<TableRowMap[T], 'id' | 'createdAt' | 'updatedAt'>>

let _db: IDBPDatabase | null = null

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db
  _db = await openDB('invoice-pro', 2, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('customers')) db.createObjectStore('customers', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('items')) db.createObjectStore('items', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('invoices')) db.createObjectStore('invoices', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('purchases')) db.createObjectStore('purchases', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('payments')) db.createObjectStore('payments', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('deletes')) db.createObjectStore('deletes', { keyPath: 'key' })
    }
  })
  const existing = await _db.get('settings', 'settings')
  const defaults: Settings = {
    id: 'settings',
    companyName: '',
    address: '',
    currency: 'USD',
    theme: 'system',
    invoiceTemplate: 'simple',
    invoicePrefix: 'INV-',
    invoiceCounter: 0,
    invoiceNumberWidth: 5,
  }
  if (!existing) await _db.put('settings', defaults)
  return _db
}

function withTimestamps<T extends { createdAt?: string; updatedAt?: string }>(row: T): T {
  const now = new Date().toISOString()
  return { ...row, updatedAt: now, createdAt: row.createdAt || now }
}

async function list<T extends TableName>(table: T): Promise<TableRowMap[T][]> {
  const db = await getDB()
  return db.getAll(table) as Promise<TableRowMap[T][]>
}

async function get<T extends TableName>(table: T, id: ID): Promise<TableRowMap[T] | undefined> {
  const db = await getDB()
  return db.get(table, id) as Promise<TableRowMap[T] | undefined>
}

async function upsert<T extends Exclude<TableName, 'deletes'>>(table: T, row: UpsertRow<T>): Promise<TableRowMap[T]> {
  const db = await getDB()
  const withId = (row as UpsertRow<T> & { id: ID | undefined }).id ? row : { ...row, id: uid() }
  // add timestamps to all except settings if you prefer; keeping for consistency
  const stamped = withTimestamps(withId as unknown as { createdAt?: string; updatedAt?: string })
  await db.put(table, stamped as TableRowMap[T])

  if (table === 'settings' && typeof window !== 'undefined') {
    localStorage.setItem('invoice-pro:settings', JSON.stringify(stamped))
    window.dispatchEvent(new CustomEvent('settings:updated'))
  }
  return stamped as TableRowMap[T]
}

async function remove<T extends Exclude<TableName, 'deletes'>>(table: T, id: ID): Promise<void> {
  const db = await getDB()
  await db.delete(table, id)
  const key = `${table}:${id}`
  const tomb: DeleteRow = { key, table, id, deletedAt: new Date().toISOString() }
  await db.put('deletes', tomb)
}

async function bulkPut<T extends Exclude<TableName, 'deletes'>>(table: T, rows: TableRowMap[T][]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(table, 'readwrite')
  for (const r of rows) await tx.store.put(r)
  await tx.done
}

async function clear<T extends TableName>(table: T): Promise<void> {
  const db = await getDB()
  await db.clear(table)
}

async function listDeletes(): Promise<DeleteRow[]> {
  const db = await getDB()
  return db.getAll('deletes') as Promise<DeleteRow[]>
}

async function clearDeletes(keys?: string[]): Promise<void> {
  const db = await getDB()
  if (!keys) {
    await db.clear('deletes')
    return
  }
  const tx = db.transaction('deletes', 'readwrite')
  for (const k of keys) await tx.store.delete(k)
  await tx.done
}

export const db = { getDB, list, get, upsert, remove, bulkPut, clear, listDeletes, clearDeletes }