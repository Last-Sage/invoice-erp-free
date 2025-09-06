// app/reports/page.tsx
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Receipt, TrendingUp, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function ReportsIndex() {
  return (
    <div className="lg:col-span-12 mt-6">
      <h2 className="text-2xl font-semibold">Reports</h2>
      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4 mt-6">
        <Link href="/reports/sales">
          <Card className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
            {/* Change: Replaced 'p-6' with specific padding 'pt-8 pb-6 px-6' */}
            <CardContent className="flex flex-col items-center justify-center space-y-3 pt-8 pb-6 px-6 text-center">
              <TrendingUp className="h-8 w-8 text-blue-500" />
              <p className="font-semibold group-hover:text-blue-500">
                Sales Report
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reports/pnl">
          <Card className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
            <CardContent className="flex flex-col items-center justify-center space-y-3 pt-8 pb-6 px-6 text-center">
              <Wallet className="h-8 w-8 text-green-500" />
              <p className="font-semibold group-hover:text-green-500">
                Profit & Loss
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reports/payments">
          <Card className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
            <CardContent className="flex flex-col items-center justify-center space-y-3 pt-8 pb-6 px-6 text-center">
              <Receipt className="h-8 w-8 text-yellow-500" />
              <p className="font-semibold group-hover:text-yellow-500">
                Payments
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reports/bills">
          <Card className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group">
            <CardContent className="flex flex-col items-center justify-center space-y-3 pt-8 pb-6 px-6 text-center">
              <FileText className="h-8 w-8 text-indigo-500" />
              <p className="font-semibold group-hover:text-indigo-500">
                Bills (Due vs Paid)
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}