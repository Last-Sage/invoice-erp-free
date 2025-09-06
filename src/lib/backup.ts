// lib/backup.ts
import { db } from './db'

const STORES = ['settings','customers','items','invoices','purchases','payments'] as const

export async function exportBackup() {
  const dump: any = { version: 1, exportedAt: new Date().toISOString(), data: {} }
  for (const s of STORES) dump.data[s] = await db.list(s as any)
  const deletes = await db.listDeletes()
  dump.deletes = deletes
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `invoice-pro-backup-${new Date().toISOString().slice(0,10)}.json`
  document.body.appendChild(a); a.click(); a.remove()
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File, { replace = false } = {}) {
  const text = await file.text()
  const json = JSON.parse(text)
  if (replace) {
    for (const s of STORES) await db.clear(s as any)
  }
  for (const s of STORES) {
    const rows = Array.isArray(json.data?.[s]) ? json.data[s] : []
    if (rows.length) await db.bulkPut(s as any, rows)
  }
  // restore deletes log
  if (Array.isArray(json.deletes)) {
    await db.clear('deletes' as any)
    const _db = await db.getDB()
    const tx = _db.transaction('deletes', 'readwrite')
    for (const d of json.deletes) await tx.store.put(d)
    await tx.done
  }
}