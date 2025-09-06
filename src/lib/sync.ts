// lib/sync.ts
'use client'
import { supabase } from './supabase/client'
import { db } from './db'

const TABLES = ['customers','items','invoices','purchases','payments'] as const
type Table = typeof TABLES[number]
const LAST = (userId: string, table: Table) => `sync:last:${userId}:${table}`

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
  // Push deletes first
  const deletes = await db.listDeletes()
  const toDelete = deletes.filter((d: any) => TABLES.includes(d.table))
  for (const d of toDelete) {
    await supabase.from(d.table).delete().eq('id', d.id)
  }
  if (toDelete.length) await db.clearDeletes(toDelete.map((d: any) => d.key))

  // Push local changes (LWW by updatedAt)
  for (const table of TABLES) {
    const last = getLast(userId, table)
    const rows: any[] = await db.list(table as any)
    const changed = last ? rows.filter(r => (r.updatedAt || r.createdAt || '') > last) : rows
    if (changed.length) {
      const payload = changed.map(r => ({ ...r, user_id: userId }))
      await supabase.from(table).upsert(payload, { onConflict: 'id' })
    }
  }

  // Pull remote changes since last
  for (const table of TABLES) {
    const last = getLast(userId, table)
    const q = last
      ? supabase.from(table).select('*').gt('updated_at', last).order('updated_at', { ascending: true })
      : supabase.from(table).select('*').order('updated_at', { ascending: true })
    const { data, error } = await q
    if (error) throw error
    if (data && data.length) {
      await db.bulkPut(table as any, data.map((r: any) => ({
        ...r,
        updatedAt: r.updated_at, createdAt: r.created_at,
      })))
      setLast(userId, table, data[data.length - 1].updated_at)
    } else if (!last) {
      setLast(userId, table, now)
    }
  }
}

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