// lib/seed.ts
import { db } from './db'
import { padInvoice } from './settings-client'
import type { Customer, Item, Invoice, Purchase } from './types'

const rand = (min: number, max: number) => Math.random() * (max - min) + min
const randint = (min: number, max: number) => Math.floor(rand(min, max + 1))
const pick = <T,>(arr: T[]) => arr[randint(0, arr.length - 1)]
const monthsAgoISO = (m: number) => {
  const d = new Date()
  d.setMonth(d.getMonth() - m)
  return d.toISOString()
}

const VENDORS = ['OfficeMax', 'Globex Supplies', 'Acme Parts', 'Paper Co', 'Logia Freight', 'FastTel', 'BlueHost']
const CUSTOMERS = ['Acme Corp', 'Globex', 'Initech', 'Hooli', 'Vehement Capital', 'Stark Industries', 'Wayne Enterprises', 'Umbrella LLC', 'Wonka Factory', 'Soylent Co', 'Massive Dynamic', 'Pied Piper', 'Cyberdyne', 'Aperture Labs', 'Tyrell Corp', 'Gringotts Bank', 'Black Mesa', 'Gekko & Co', 'Dunder Mifflin', 'Vandelay Industries']

export async function seedDemoData() {
  const settings = await db.get('settings', 'settings')
  const prefix = settings?.invoicePrefix || 'INV-'
  let nextNo = settings?.nextInvoiceNumber || 1

  // Customers
  const customers: Customer[] = []
  for (let i = 0; i < 20; i++) {
    const c: Customer = {
      id: crypto.randomUUID(),
      name: CUSTOMERS[i],
      email: `${CUSTOMERS[i].toLowerCase().replace(/\s+/g, '')}@example.com`,
      phone: '+1-555-01' + String(i).padStart(2, '0'),
      taxId: 'TAX' + String(100000 + i),
      billingAddress: { line1: `${100 + i} Market St` },
      createdAt: new Date().toISOString(),
    }
    await db.upsert('customers', c)
    customers.push(c)
  }

  // Items
  const items: Item[] = []
  for (let i = 0; i < 20; i++) {
    const p = Number(rand(5, 50).toFixed(2))
    const sp = Number((p * rand(1.2, 2.2)).toFixed(2))
    const it: Item = {
      id: crypto.randomUUID(),
      sku: 'SKU' + String(1000 + i),
      name: `Item ${i + 1}`,
      unitPrice: sp,
      purchasePrice: p,
      stockQty: randint(0, 100),
      taxRate: pick([0, 5, 12, 18]),
      category: pick(['General', 'Service', 'Accessory']),
    }
    await db.upsert('items', it)
    items.push(it)
  }

  // Invoices
  for (let i = 0; i < 24; i++) {
    const customer = pick(customers)
    const lineCount = randint(1, 5)
    const lines = Array.from({ length: lineCount }).map(() => {
      const it = pick(items)
      const qty = randint(1, 5)
      return {
        itemId: it.id,
        description: it.name,
        qty,
        unitPrice: it.unitPrice,
        purchasePrice: it.purchasePrice || 0,
        taxRate: it.taxRate || 0
      }
    })
    const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
    const taxTotal = lines.reduce((s, l) => s + (l.qty * l.unitPrice) * (l.taxRate || 0) / 100, 0)
    const discount = randint(0, 1) ? Number(rand(0, subtotal * 0.1).toFixed(2)) : 0
    const total = Number((subtotal + taxTotal - discount).toFixed(2))
    const date = monthsAgoISO(randint(0, 11))
    const dueDate = monthsAgoISO(Math.max(0, randint(0, 11) - 1))
    const status = pick(['paid', 'draft', 'sent', 'overdue'])

    const number = `${prefix}${padInvoice(nextNo++)}`

    const inv: Invoice = {
      id: crypto.randomUUID(),
      number,
      customerId: customer.id,
      customerName: customer.name,
      customerTaxId: customer.taxId,
      date, dueDate, status,
      lines,
      subtotal, taxTotal, discount, total
    }
    await db.upsert('invoices', inv)

    if (status === 'paid') {
      await db.upsert('payments', {
        id: crypto.randomUUID(),
        type: 'in',
        invoiceId: inv.id,
        date,
        amount: total,
        method: 'bank'
      })
    }
  }

  // Purchases
  for (let i = 0; i < 12; i++) {
    const vendor = pick(VENDORS)
    const lineCount = randint(1, 4)
    const lines = Array.from({ length: lineCount }).map((_, idx) => ({
      description: `${vendor} — line ${idx + 1}`,
      amount: Number(rand(20, 300).toFixed(2))
    }))
    const total = Number(lines.reduce((s, l) => s + l.amount, 0).toFixed(2))
    const date = monthsAgoISO(randint(0, 11))
    const dueDate = monthsAgoISO(Math.max(0, randint(0, 11) - 1))
    const status = pick(['paid', 'unpaid', 'overdue', 'partial'])
    const pur: Purchase = {
      id: crypto.randomUUID(),
      vendor, date, dueDate, category: pick(['Utilities', 'Supplies', 'Services']),
      lines, total, status
    }
    await db.upsert('purchases', pur)
    if (status === 'paid' || randint(0,1) === 1) {
      await db.upsert('payments', {
        id: crypto.randomUUID(),
        type: 'out',
        purchaseId: pur.id,
        date,
        amount: total,
        method: 'bank'
      })
    }
  }

  await db.updateSettings({ nextInvoiceNumber: nextNo })
}