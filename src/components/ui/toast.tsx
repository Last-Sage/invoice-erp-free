// components/ui/toast.tsx
'use client'
import React, { createContext, useContext, useState, useCallback } from 'react'
import { X } from 'lucide-react'

type Toast = { id: string; title?: string; message: string; variant?: 'success'|'error'|'info' }
type Ctx = { push: (t: Omit<Toast,'id'>) => void }
const ToastCtx = createContext<Ctx | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((t: Omit<Toast,'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((list) => [...list, { id, ...t }])
    setTimeout(() => setToasts((list) => list.filter(x => x.id !== id)), 3500)
  }, [])
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`surface card-rounded px-4 py-3 shadow smooth border ${t.variant === 'success' ? 'border-green-500/40' : t.variant === 'error' ? 'border-red-500/40' : ''}`}>
            <div className="flex items-start gap-3">
              <div>
                {t.title && <div className="text-sm font-semibold">{t.title}</div>}
                <div className="text-sm text-muted-foreground">{t.message}</div>
              </div>
              <button className="ml-auto opacity-60 hover:opacity-100" onClick={() => setToasts(list => list.filter(x => x.id !== t.id))}><X className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}