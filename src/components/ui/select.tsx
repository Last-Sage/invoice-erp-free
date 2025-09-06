// components/ui/select.tsx
'use client'
import * as React from 'react'
import { Label } from './label'
import { cn } from '@/lib/utils'

export function Select({
  label, value, onValueChange, options, error
}: { label?: string; value: string; onValueChange: (v: string) => void; options: { label: string; value: string }[]; error?: string }) {
  return (
    <div className="w-full space-y-1.5">
      {label && <Label className={cn(error && 'text-red-600')}>{label}</Label>}
      <select
        className={cn('h-9 w-full rounded-md border bg-background px-3 text-sm',
          error && 'border-red-500 focus-visible:ring-red-500/30')}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
}