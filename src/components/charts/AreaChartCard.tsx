// components/charts/AreaChartCard.tsx
'use client'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const AreaChart = dynamic(() => import('./_impl').then(m => m.AreaChartImpl), { ssr: false })

export default function AreaChartCard({ title, data, xKey, yKey, color }: any) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <AreaChart data={data} xKey={xKey} yKey={yKey} color={color} />
      </CardContent>
    </Card>
  )
}