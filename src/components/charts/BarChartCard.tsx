// components/charts/BarChartCard.tsx
'use client'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const BarChart = dynamic(() => import('./_impl').then(m => m.BarChartImpl), { ssr: false })

export default function BarChartCard({ title, data, xKey, bars }: any) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <BarChart data={data} xKey={xKey} bars={bars} />
      </CardContent>
    </Card>
  )
}