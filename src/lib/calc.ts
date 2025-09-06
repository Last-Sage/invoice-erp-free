// lib/calc.ts
export function computePnl(
  sales: { date: string; sales: number }[],
  purchases: { date: string; purchases: number }[]
) {
  const map = new Map<string, { date: string; income: number; expenses: number }>()
  sales.forEach(s => {
    const e = map.get(s.date) || { date: s.date, income: 0, expenses: 0 }
    e.income += s.sales || 0
    map.set(s.date, e)
  })
  purchases.forEach(p => {
    const e = map.get(p.date) || { date: p.date, income: 0, expenses: 0 }
    e.expenses += p.purchases || 0
    map.set(p.date, e)
  })
  const series = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date))
  const income = series.reduce((s, e) => s + e.income, 0)
  const expenses = series.reduce((s, e) => s + e.expenses, 0)
  return { series, income, expenses, grossProfit: income - expenses }
}