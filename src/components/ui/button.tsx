// components/ui/button.tsx
import { cn } from '@/lib/utils'
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  children: React.ReactNode
}

export function Button({ className, variant = 'default', size = 'default', asChild, ...props }: Props & { asChild?: boolean }) {
  const Comp: any = (props as any).asChild ? 'span' : 'button'
  const styles = cn(
    'inline-flex items-center justify-center whitespace-nowrap pill text-sm font-medium smooth',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
    variant === 'default' && 'bg-primary text-primary-foreground hover:bg-[hsl(var(--primary)/0.9)] shadow-sm',
    variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-[hsl(var(--secondary)/0.9)] border',
    variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-[hsl(var(--destructive)/0.9)] shadow-sm',
    variant === 'ghost' && 'hover:bg-muted',
    size === 'default' && 'h-9 px-4',
    size === 'sm' && 'h-8 px-3',
    size === 'lg' && 'h-10 px-5',
    size === 'icon' && 'h-9 w-9',
    className
  )
  if (asChild) return <Comp className={styles} {...props} />
  return <button className={styles} {...props} />
}