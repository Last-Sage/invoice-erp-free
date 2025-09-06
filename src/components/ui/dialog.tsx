// components/ui/dialog.tsx
'use client'
import * as React from 'react'
import { Button } from './button'

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={() => onOpenChange(false)} />
      <div className="relative surface card-rounded w-[90%] max-w-md p-5">
        <div className="text-lg font-semibold mb-1">{title}</div>
        {description && <div className="text-sm text-muted-foreground mb-4">{description}</div>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>{cancelText}</Button>
          <Button onClick={() => { onOpenChange(false); onConfirm() }}>{confirmText}</Button>
        </div>
      </div>
    </div>
  )
}