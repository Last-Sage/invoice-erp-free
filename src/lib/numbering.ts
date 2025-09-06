// lib/numbering.ts
import { db } from './db'

function pad(num: number, width: number) {
  return num.toString().padStart(width, '0')
}

export async function previewNextInvoiceNumber() {
  const s = await db.getSettings()
  const next = (s.invoiceCounter ?? 0) + 1
  const width = s.invoiceNumberWidth ?? 5
  const prefix = s.invoicePrefix || ''
  return `${prefix}${pad(next, width)}`
}

export async function consumeNextInvoiceNumber() {
  const s = await db.getSettings()
  const next = (s.invoiceCounter ?? 0) + 1
  const width = s.invoiceNumberWidth ?? 5
  const prefix = s.invoicePrefix || ''
  await db.upsert('settings', { ...s, invoiceCounter: next })
  return `${prefix}${pad(next, width)}`
}