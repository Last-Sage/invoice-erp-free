// lib/reporting.ts
import { db } from './db'

const ym = (d: string) => new Date(d || Date.now()).toISOString().slice(0,7)

export async function buildMonthlyPnl() {
  const [invoices, purchases, items] = await Promise.all([
    db.list('invoices'),
    db.list('purchases'),
    db.list('items'),
  ])
  const itemsMap = new Map(items.map((i: any) => [i.id, i]))

  const map = new Map<string, { date: string; income: number; cogs: number; opex: number }>()
  // income + cogs from invoices
  invoices.forEach((inv: any) => {
    const key = ym(inv.date)
    const e = map.get(key) || { date: key, income: 0, cogs: 0, opex: 0 }
    e.income += inv.total || 0
    const cogs = (inv.lines || []).reduce((s: number, l: any) => {
      const item = l.itemId ? itemsMap.get(l.itemId) : undefined
      const purchasePrice = Number(item?.purchasePrice || 0)
      return s + (purchasePrice * Number(l.qty || 0))
    }, 0)
    e.cogs += cogs
    map.set(key, e)
  })
  // operating expenses from purchases
  purchases.forEach((p: any) => {
    const key = ym(p.date)
    const e = map.get(key) || { date: key, income: 0, cogs: 0, opex: 0 }
    e.opex += p.total || 0
    map.set(key, e)
  })

  const series = Array.from(map.values()).sort((a,b) => a.date.localeCompare(b.date))
  const income = series.reduce((s, e) => s + e.income, 0)
  const cogs = series.reduce((s, e) => s + e.cogs, 0)
  const opex = series.reduce((s, e) => s + e.opex, 0)
  const expenses = cogs + opex
  const grossProfit = income - cogs
  const netProfit = income - expenses

  // for charts expecting income vs expenses
  const incomeExpenses = series.map((e) => ({ date: e.date, income: e.income, expenses: e.cogs + e.opex }))

  return { series, income, cogs, opex, expenses, grossProfit, netProfit, incomeExpenses }
}