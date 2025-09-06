// app/page.tsx
'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { db } from '@/lib/db'
import AreaChartCard from '@/components/charts/AreaChartCard'
import BarChartCard from '@/components/charts/BarChartCard'
import { computePnl } from '@/lib/calc'
import { buildMonthlyPnl } from '@/lib/reporting'

export default function DashboardPage() {
  const [salesData, setSalesData] = useState<{ date: string; sales: number }[]>([])
  const [purchaseData, setPurchaseData] = useState<{ date: string; purchases: number }[]>([])
  const [payments, setPayments] = useState<{ in: number; out: number }>({ in: 0, out: 0 })
  const [overview, setOverview] = useState({ total: 0, paid: 0, unpaid: 0, overdue: 0, totalAmount: 0, unpaidAmount: 0, paidAmount: 0 })
  const [pnlSeries, setPnlSeries] = useState<any[]>([])
  const [pnl, setPnl] = useState({ income: 0, expenses: 0, grossProfit: 0, netProfit: 0 })

  useEffect(() => {
    (async () => {
      const invoices = await db.list('invoices')
      const purchases = await db.list('purchases')
      const pays = await db.list('payments')

      const byMonth = (dateStr: string) => new Date(dateStr).toISOString().slice(0, 7)

      const salesMap = new Map<string, number>()
      invoices.forEach((inv: any) => {
        const key = byMonth(inv.date || new Date().toISOString())
        salesMap.set(key, (salesMap.get(key) || 0) + (inv.total || 0))
      })
      const purchMap = new Map<string, number>()
      purchases.forEach((p: any) => {
        const key = byMonth(p.date || new Date().toISOString())
        purchMap.set(key, (purchMap.get(key) || 0) + (p.total || 0))
      })

      setSalesData(Array.from(salesMap.entries()).map(([date, sales]) => ({ date, sales })))
      setPurchaseData(Array.from(purchMap.entries()).map(([date, purchases]) => ({ date, purchases })))

      const paymentsIn = pays.filter((p: any) => p.type === 'in').reduce((s: number, p: any) => s + (p.amount || 0), 0)
      const paymentsOut = pays.filter((p: any) => p.type === 'out').reduce((s: number, p: any) => s + (p.amount || 0), 0)
      setPayments({ in: paymentsIn, out: paymentsOut })

  const total = invoices.length
      const paid = invoices.filter((i:any)=>i.status==='paid').length
      const overdue = invoices.filter((i:any)=>i.status==='overdue').length
      const unpaid = total - paid
      const totalAmount = invoices.reduce((s:number,i:any)=>s+(i.total||0),0)
      const paidAmount = invoices.filter((i:any)=>i.status==='paid').reduce((s:number,i:any)=>s+(i.total||0),0)
      const unpaidAmount = totalAmount - paidAmount
      setOverview({ total, paid, unpaid, overdue, totalAmount, unpaidAmount, paidAmount })

      const pnl = await buildMonthlyPnl()
      setPnlSeries(pnl.incomeExpenses)
      setPnl({ income: pnl.income, expenses: pnl.expenses, grossProfit: pnl.grossProfit, netProfit: pnl.netProfit })
    })()
  }, [])

  return (
    <div className="grid gap-5 md:gap-6 grid-cols-1 lg:grid-cols-12">
      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Cashflow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payments In</span>
            <span className="font-semibold">{formatCurrency(payments.in)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payments Out</span>
            <span className="font-semibold">{formatCurrency(payments.out)}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-2">
            <span className="text-muted-foreground">Net</span>
            <span className="font-semibold">{formatCurrency(payments.in - payments.out)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Profit & Loss</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Gross Profit</span>
            <span className="font-semibold">{formatCurrency(pnl.grossProfit)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Invoices</span>
              <span className="font-semibold">{overview.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Paid</span>
              <span className="font-semibold">{overview.paid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Unpaid</span>
              <span className="font-semibold">{overview.unpaid}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">Overdue</span>
              <span className="font-semibold text-orange-500">{overview.overdue}</span>
            </div>
          </CardContent>
      </Card>

      <div className="lg:col-span-6">
        <AreaChartCard
          title="Sales by Month"
          data={salesData}
          xKey="date"
          yKey="sales"
          color="#22c55e"
        />
      </div>
      <div className="lg:col-span-6">
        <BarChartCard
          title="Purchases by Month"
          data={purchaseData}
          xKey="date"
          bars={[{ dataKey: 'purchases', fill: '#3b82f6' }]}
        />
      </div>
    </div>
  )
}