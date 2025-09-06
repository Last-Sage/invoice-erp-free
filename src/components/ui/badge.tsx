// components/ui/badge.tsx
import { cn } from '@/lib/utils'

export function Badge({ children, variant = 'secondary' }: { children: React.ReactNode, variant?: 'secondary' | 'success' | 'destructive' }) {
  const classes = cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
    variant === 'secondary' && 'border-transparent bg-secondary text-secondary-foreground',
    variant === 'success' && 'border-transparent bg-green-600 text-white',
    variant === 'destructive' && 'border-transparent bg-destructive text-destructive-foreground',
  )
  return <span className={classes}>{children}</span>
}