// components/ui/input.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, label, error, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <Label className={cn(error && 'text-red-600')}>{label}</Label>}
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border bg-background px-3 py-1 text-sm shadow-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          error ? 'border-red-500 focus-visible:ring-red-500/30' : 'focus-visible:ring-ring',
          'placeholder:text-muted-foreground',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
})
Input.displayName = 'Input'
export { Input }