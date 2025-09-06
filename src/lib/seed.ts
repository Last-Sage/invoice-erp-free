// lib/seed.ts
import { db } from './db'
import { consumeNextInvoiceNumber } from './numbering'
import { uid } from './utils'

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const sample = <T,>(arr: T[]) => arr[rand(0, arr.length - 1)]

export async function seedDemoData() {
  // Clear existing optional? We won't delete user data. Just append.
  const names = ['Acme Co', 'Globex', 'Initech', 'Umbrella', 'Soylent', 'Wonka', 'Stark', 'Wayne', 'Hooli', 'Pied Piper', 'Aperture', 'Gringotts', 'Cyberdyne', 'Oscorp', 'Vandelay', 'Massive Dynamic', 'Tyrell', 'Dinoco', 'Babel', 'Vehement']
  const firstNames = ['Alex', 'Taylor', 'Jordan', 'Riley', 'Charlie', 'Jamie', 'Sam', 'Morgan', 'Drew', 'Avery']
  const lastNames = ['Smith', 'Johnson', 'Lee', 'Patel', 'Garcia', 'Brown', 'Davis', 'Miller', 'Wilson', 'Anderson']
  const cat = ['Hardware', 'Software', 'Services', 'Accessories', 'Office', 'Maintenance']


  const s = await db.get('settings', 'settings')
  if (!s?.companyName) {
    await db.upsert('settings', {
      ...s,
      id: 'settings',
      companyName: 'Demo Labs LLC',
      address: '1 Infinite Loop, Cupertino, CA 95014',
      taxId: 'DEMO-TAX-12345',
      contactName: 'Ava Stone',
      contactEmail: 'ava@demolabs.test',
      contactPhone: '+1 (555) 010-2000',
      website: 'https://demo.example',
    })
  }

  // Items (20)
  const items: any[] = []
  for (let i = 0; i < 20; i++) {
    const n = `${sample(cat)} ${i + 1}`
    const purchasePrice = rand(5, 80)
    const unitPrice = purchasePrice + rand(10, 100)
    const it = await db.upsert('items', {
      sku: `SKU-${rand(1000, 9999)}`,
      name: n,
      unitPrice,
      purchasePrice,
      stockQty: rand(5, 100),
      taxRate: [0, 5, 12, 18][rand(0, 3)],
      category: sample(cat),
      description: 'Demo item'
    })
    items.push(it)
  }

  // Customers (20)
  const customers = []
  for (let i = 0; i < 20; i++) {
    const c = await db.upsert('customers', {
      name: `${sample(names)} ${sample(['LLC', 'Inc', 'Ltd', 'GmbH', 'SARL'])}`,
      email: `${sample(firstNames).toLowerCase()}.${sample(lastNames).toLowerCase()}@example.com`,
      phone: `+1-555-${rand(100, 999)}-${rand(1000, 9999)}`,
      taxId: `TIN${rand(100000, 999999)}`,
      billingAddress: { line1: `${rand(100, 999)} Market St` },
      shippingAddress: { line1: `${rand(100, 999)} Market St` },
    })
    customers.push(c)
  }

  // Purchases (20)
  const purchases = []
  for (let i = 0; i < 20; i++) {
    const lines = Array.from({ length: rand(1, 3) }).map(() => ({
      description: `Expense ${rand(1, 999)}`,
      amount: rand(20, 300)
    }))
    const total = lines.reduce((s, l) => s + l.amount, 0)
    const status = sample(['unpaid', 'paid'])
    const date = new Date(Date.now() - rand(0, 180) * 86400000).toISOString()
    const dueDate = new Date(new Date(date).getTime() + rand(7, 30) * 86400000).toISOString()
    const p = await db.upsert('purchases', {
      vendor: sample(names),
      date,
      dueDate,
      category: sample(cat),
      lines,
      total,
      status,
    })
    purchases.push(p)
    if (status === 'paid') {
      await db.upsert('payments', {
        type: 'out', purchaseId: p.id, date: new Date().toISOString(), amount: total, method: 'bank'
      })
    }
  }

  // Invoices (30)
  for (let i = 0; i < 30; i++) {
    const customer = sample(customers)
    const lineCount = rand(1, 4)
    const lines = Array.from({ length: lineCount }).map(() => {
      const it = sample(items)
      const qty = rand(1, 5)
      return {
        itemId: it.id,
        description: it.name,
        qty,
        unitPrice: it.unitPrice,
        taxRate: it.taxRate || 0
      }
    })
    const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)
    const taxTotal = lines.reduce((s, l) => s + (l.qty * l.unitPrice) * (l.taxRate || 0) / 100, 0)
    const discount = [0, 0, 0, 5, 10][rand(0, 4)]
    const total = Math.max(0, subtotal + taxTotal - discount)
    const date = new Date(Date.now() - rand(0, 180) * 86400000).toISOString()
    const dueDate = new Date(new Date(date).getTime() + rand(7, 30) * 86400000).toISOString()
    const number = await consumeNextInvoiceNumber()
    const status = sample(['draft', 'sent', 'paid'])
    const inv = await db.upsert('invoices', {
      number,
      customerId: customer.id,
      customerName: customer.name,
      customerTaxId: customer.taxId,
      date, dueDate, status,
      lines,
      subtotal, taxTotal, discount, total,
      notes: 'Demo invoice'
    })
    if (status === 'paid') {
      await db.upsert('payments', {
        type: 'in', invoiceId: inv.id, date: new Date().toISOString(), amount: total, method: 'bank'
      })
    }
  }
}