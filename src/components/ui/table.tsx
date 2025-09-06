// components/ui/table.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'

function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
}
function THead(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <thead {...props} className="bg-muted/60 sticky top-0" /> }
function TBody(props: React.HTMLAttributes<HTMLTableSectionElement>) { return <tbody {...props} /> }
function TR(props: React.HTMLAttributes<HTMLTableRowElement>) { return <tr {...props} className="border-b last:border-0 hover:bg-muted/40 smooth" /> }
function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('h-10 px-3 text-left align-middle font-medium text-muted-foreground', className)} {...props} />
}
function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('p-3 align-middle', className)} {...props} />
}

export { Table, THead, TBody, TR, TH, TD }