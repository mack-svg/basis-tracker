'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import type { BasisTrend, Commodity } from '@/types/database'

interface BasisChartProps {
  data: BasisTrend[]
  commodity: Commodity
}

export default function BasisChart({ data, commodity }: BasisChartProps) {
  const chartData = data.map(d => ({
    date: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    basis: d.median_basis,
    reports: d.report_count,
  }))

  const lineColor = commodity === 'corn' ? '#eab308' : '#22c55e'

  // Calculate Y axis domain with some padding
  const values = chartData.map(d => d.basis)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const padding = Math.max(5, Math.abs(maxValue - minValue) * 0.1)

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={false}
            domain={[minValue - padding, maxValue + padding]}
            tickFormatter={(value) => `${value}¢`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${value}¢`, 'Basis']}
            labelFormatter={(label) => label}
          />
          <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />
          <Line
            type="monotone"
            dataKey="basis"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ fill: lineColor, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
