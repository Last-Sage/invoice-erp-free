// components/ui/sort.tsx
'use client'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SortDir = 'asc' | 'desc'
export type SortState<T extends string = string> = { key: T; dir: SortDir } | null

export function nextDir(dir?: SortDir): SortDir {
  return dir === 'asc' ? 'desc' : 'asc'
}

export function SortHeader<T extends string>({
  label, sortKey, sort, setSort, className,
}: { label: string; sortKey: T; sort: SortState<T>; setSort: (s: SortState<T>) => void; className?: string }) {
  const active = sort?.key === sortKey
  const dir = active ? sort!.dir : undefined
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown
  return (
    <button
      type="button"
      onClick={() => setSort(active ? { key: sortKey, dir: nextDir(dir) } : { key: sortKey, dir: 'asc' })}
      className={cn('inline-flex items-center gap-1 hover:underline', className)}
      aria-label={`Sort by ${label}`}
    >
      <span>{label}</span>
      <Icon className="w-4 h-4 opacity-60" />
    </button>
  )
}

export function applySort<T>(rows: T[], sort: SortState<string>, comparators: Record<string, (a: T, b: T) => number>) {
  if (!sort) return rows
  const cmp = comparators[sort.key]
  if (!cmp) return rows
  const sorted = [...rows].sort(cmp)
  return sort.dir === 'asc' ? sorted : sorted.reverse()
}