// app/reports/pnl/page.tsx
'use client'
import { useEffect, useState } from 'react'
import BarChartCard from '@/components/charts/BarChartCard'
import { formatCurrency } from '@/lib/utils'
import { buildMonthlyPnl } from '@/lib/reporting'

export default function PnlReportPage() {
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)
  const [grossProfit, setGrossProfit] = useState(0)
  const [netProfit, setNetProfit] = useState(0)
  const [series, setSeries] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const pnl = await buildMonthlyPnl()
      setIncome(pnl.income); setExpenses(pnl.expenses); setGrossProfit(pnl.grossProfit); setNetProfit(pnl.netProfit)
      setSeries(pnl.incomeExpenses)
    })()
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Profit & Loss</h1>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="border rounded-md p-3">
          <div className="text-sm text-muted-foreground">Income</div>
          <div className="text-xl font-semibold">{formatCurrency(income)}</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="text-sm text-muted-foreground">Expenses</div>
          <div className="text-xl font-semibold">{formatCurrency(expenses)}</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="text-sm text-muted-foreground">Gross Profit</div>
          <div className="text-xl font-semibold">{formatCurrency(grossProfit)}</div>
        </div>
        <div className="border rounded-md p-3">
          <div className="text-sm text-muted-foreground">Net Profit</div>
          <div className="text-xl font-semibold">{formatCurrency(netProfit)}</div>
        </div>
      </div>
      <BarChartCard title="Income vs Expenses" data={series} xKey="date" bars={[
        { dataKey: 'income', fill: '#22c55e' },
        { dataKey: 'expenses', fill: '#ef4444' },
      ]} />
    </div>
  )
}