// app/reports/page.tsx
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Receipt, TrendingUp, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function ReportsIndex() {
  return (
    <div className="lg:col-span-12 mt-6">
            <h2 className="text-2xl font-semibold">Reports</h2>
            <div className="grid gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-8">
                <Link href="/reports/sales">
                    <Card className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group aspect-square mt-6">
                        <CardContent className="p-1 flex flex-col items-center text-center space-y-3 justify-center h-full">
                            <TrendingUp className="h-8 w-8 text-blue-500" />
                            <p className="font-semibold group-hover:text-blue-500">Sales Report</p>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/reports/pnl">
                    <Card className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group aspect-square mt-6">
                        <CardContent className="p-1 flex flex-col items-center text-center space-y-3 justify-center h-full">
                            <Wallet className="h-8 w-8 text-green-500" />
                            <p className="font-semibold group-hover:text-green-500">Profit & Loss</p>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/reports/payments">
                    <Card className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group aspect-square mt-6">
                        <CardContent className="p-1 flex flex-col items-center text-center space-y-3 justify-center h-full">
                            <Receipt className="h-8 w-8 text-yellow-500" />
                            <p className="font-semibold group-hover:text-yellow-500">Payments</p>
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/reports/bills">
                    <Card className="hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors group aspect-square mt-6">
                        <CardContent className="p-1 flex flex-col items-center text-center space-y-3 justify-center h-full">
                            <FileText className="h-8 w-8 text-indigo-500" />
                            <p className="font-semibold group-hover:text-indigo-500">Bills (Due vs Paid)</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
  )
}