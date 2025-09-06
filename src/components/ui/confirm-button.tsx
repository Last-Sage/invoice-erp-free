// components/ui/confirm-button.tsx
'use client'
import { useState } from 'react'
import { Button } from './button'
import { ConfirmDialog } from './dialog'

type Props = {
  onConfirm: () => Promise<void> | void
  variant?: 'default' | 'secondary' | 'destructive' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: React.ReactNode
  title?: string
  description?: string
}
export default function ConfirmButton({
  onConfirm, variant = 'destructive', size = 'default', children,
  title = 'Are you sure?', description = 'This action cannot be undone.',
}: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>{children}</Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmText="Delete"
        onConfirm={() => Promise.resolve(onConfirm())}
      />
    </>
  )
}