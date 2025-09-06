// components/ui/textarea.tsx
import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && <Label className={cn(error && 'text-red-600')}>{label}</Label>}
      <textarea
        className={cn(
          'flex w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm',
          error ? 'border-red-500 focus-visible:ring-red-500/30' : 'focus-visible:ring-ring',
          'focus-visible:outline-none focus-visible:ring-2',
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  )
})
Textarea.displayName = 'Textarea'
export { Textarea }