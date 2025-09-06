// components/charts/_impl.tsx
'use client'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from 'recharts'

export function AreaChartImpl({ data, xKey, yKey, color }: any) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey={yKey} stroke={color} fill="url(#g1)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarChartImpl({ data, xKey, bars }: any) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {bars.map((b: any, i: number) => (
            <Bar key={i} dataKey={b.dataKey} fill={b.fill} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}