// lib/types.ts
export type ID = string

export type Settings = {
  id: 'settings'
  companyName: string
  address: string
  taxId?: string
  currency?: string
  theme?: 'light' | 'dark' | 'system'
  invoiceTemplate?: 'simple' | 'compact'
  invoicePrefix?: string
  invoiceCounter?: number
  invoiceNumberWidth?: number
  // issuer/person data
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  logoDataUrl?: string
}

export type Address = { line1?: string; line2?: string; city?: string; state?: string; zip?: string; country?: string }

export type Customer = {
  id: ID
  name: string
  email?: string
  phone?: string
  billingAddress?: Address
  shippingAddress?: Address
  taxId?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export type Item = {
  id: ID
  sku?: string
  name: string
  description?: string
  stockQty?: number
  unitPrice: number
  purchasePrice?: number
  taxRate?: number
  category?: string
  createdAt?: string
  updatedAt?: string
}

export type InvoiceLine = { itemId?: ID; description: string; qty: number; unitPrice: number; taxRate?: number; purchasePrice?: number }
export type Invoice = {
  id: ID
  number: string
  customerId: ID
  customerName?: string
  customerTaxId?: string
  date: string
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void'
  lines: InvoiceLine[]
  subtotal?: number
  taxTotal?: number
  discount?: number
  total?: number
  notes?: string
}

export type PurchaseLine = { description: string; amount: number }
export type Purchase = {
  id: ID
  vendor: string
  date: string
  dueDate?: string
  category?: string
  lines: PurchaseLine[]
  total: number
  status: 'unpaid' | 'paid' | 'overdue' | 'partial'
  notes?: string
}

export type Payment = {
  id: ID
  date: string
  type: 'in' | 'out'
  amount: number
  method?: string
  invoiceId?: ID
  purchaseId?: ID
}