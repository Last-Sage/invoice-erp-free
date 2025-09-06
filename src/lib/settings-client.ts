// lib/settings-client.ts
'use client'
import { useEffect, useState, useCallback } from 'react'
import type { Settings } from './types'
import { db } from './db'

const EVT = 'settings:updated'

const defaults: Settings = {
  id: 'settings',
  companyName: '',
  address: '',
  currency: 'USD',
  locale: 'en-US',
  theme: 'system',
  invoiceTemplate: 'simple',
  invoicePrefix: 'INV-',
  nextInvoiceNumber: 1,
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaults)

  const load = useCallback(async () => {
    const s = (await db.get('settings', 'settings')) as Settings
    setSettings(s || defaults)
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<Settings> | undefined
      load()
    }
    window.addEventListener(EVT, handler as any)
    return () => window.removeEventListener(EVT, handler as any)
  }, [load])

  const save = useCallback(async (patch: Partial<Settings> | Settings) => {
    const next = await db.updateSettings(patch as any)
    setSettings(next)
    window.dispatchEvent(new CustomEvent(EVT, { detail: patch }))
    return next
  }, [])

  return { settings, save, refresh: load }
}

export function padInvoice(n: number, width = 5) {
  const s = String(n)
  return s.length >= width ? s : '0'.repeat(width - s.length) + s
}