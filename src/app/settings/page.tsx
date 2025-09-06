// app/settings/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { db } from '@/lib/db'
import { seedDemoData } from '@/lib/seed'
import { syncNow, getSyncPrefs, setSyncPrefs } from '@/lib/sync'
import { exportBackup, importBackup } from '@/lib/backup'
import { useAuth } from '@/lib/auth-client'
import { useToast } from '@/components/ui/toast'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

type SettingsForm = {
  id: 'settings'
  companyName: string
  address: string
  taxId?: string
  currency: string
  theme: 'light' | 'dark' | 'system'
  invoiceTemplate: 'simple' | 'compact'
  invoicePrefix?: string
  invoiceCounter?: number
  invoiceNumberWidth?: number
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  logoDataUrl?: string
}

export default function SettingsPage() {
  const { setTheme } = useTheme()
  const { user } = useAuth()
  const { push } = useToast()

  const [form, setForm] = useState<SettingsForm>({
    id: 'settings',
    companyName: '',
    address: '',
    taxId: '',
    currency: 'USD',
    theme: 'system',
    invoiceTemplate: 'simple',
    invoicePrefix: 'INV-',
    invoiceCounter: 0,
    invoiceNumberWidth: 5,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logoDataUrl: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cloud sync prefs (local-only)
  const initialPrefs = getSyncPrefs()
  const [syncAuto, setSyncAuto] = useState<boolean>(initialPrefs.auto)
  const [syncIntervalMin, setSyncIntervalMin] = useState<number>(Math.max(1, Math.round(initialPrefs.interval / 60000)))
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    ;(async () => {
      const s = await db.get('settings', 'settings')
      if (s) setForm((prev) => ({ ...prev, ...s }))
      setLoading(false)
    })()
  }, [])

  const set = (k: keyof SettingsForm, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.currency) e.currency = 'Currency is required'
    if (!form.theme) e.theme = 'Theme is required'
    const width = Number(form.invoiceNumberWidth || 0)
    if (isNaN(width) || width < 1 || width > 12) e.invoiceNumberWidth = 'Width must be 1-12'
    if (form.contactEmail && !/^\S+@\S+\.\S+$/.test(form.contactEmail)) e.contactEmail = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSave = async () => {
    if (!validate()) {
      push({ variant: 'error', message: 'Please fix validation errors.' })
      return
    }
    setSaving(true)
    try {
      const saved = await db.upsert('settings', form)
      setTheme(saved.theme || 'system')
      setForm((f) => ({ ...f, ...saved }))
      push({ variant: 'success', message: 'Settings saved.' })
    } catch (e: any) {
      push({ variant: 'error', message: 'Failed to save settings.' })
    } finally {
      setSaving(false)
    }
  }

  const resetCounter = async () => {
    const next = { ...(await db.get('settings', 'settings')), invoiceCounter: 0 }
    await db.upsert('settings', next)
    setForm((f) => ({ ...f, invoiceCounter: 0 }))
    push({ variant: 'success', message: 'Invoice counter reset to 0.' })
  }

  const onLogoChange = (file?: File) => {
    if (!file) {
      set('logoDataUrl', '')
      return
    }
    const reader = new FileReader()
    reader.onload = () => set('logoDataUrl', String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  // Cloud sync actions
  const onSyncNow = async () => {
    if (!user) {
      push({ variant: 'error', message: 'Sign in to sync with cloud.' })
      return
    }
    setSyncing(true)
    try {
      await syncNow(user.id)
      push({ variant: 'success', message: 'Sync complete.' })
    } catch (e: any) {
      push({ variant: 'error', message: `Sync failed: ${e?.message || e}` })
    } finally {
      setSyncing(false)
    }
  }

  const onChangeSyncPrefs = (auto: boolean, minutes: number) => {
    setSyncPrefs({ auto, interval: Math.max(1, minutes) * 60000 })
    push({ variant: 'info', message: `Cloud sync ${auto ? 'enabled' : 'disabled'} • every ${Math.max(1, minutes)} min` })
  }

  useEffect(() => {
    // reflect latest prefs to storage whenever state changes
    onChangeSyncPrefs(syncAuto, syncIntervalMin)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncAuto, syncIntervalMin])

  const onBackup = async () => {
    await exportBackup()
    push({ variant: 'success', message: 'Backup downloaded.' })
  }

  const onRestore = async (file?: File) => {
    if (!file) return
    const replace = confirm('Replace existing data with backup? Choose OK to replace, Cancel to merge.')
    try {
      await importBackup(file, { replace })
      push({ variant: 'success', message: 'Restore complete.' })
    } catch (e: any) {
      push({ variant: 'error', message: `Restore failed: ${e?.message || e}` })
    }
  }

  const onSeed = async () => {
    if (!confirm('Seed demo data? This will add demo customers, items, invoices, purchases, and payments.')) return
    await seedDemoData()
    push({ variant: 'success', message: 'Demo data seeded. Check Dashboard/Invoices.' })
  }

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-sm text-muted-foreground">
        Loading settings…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Company & Identity */}
      <Card className="max-w-4xl">
        <CardHeader><CardTitle>Company & Identity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Company / Firm Name" value={form.companyName} onChange={(e) => set('companyName', e.target.value)} />
          <Input label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} />
          <Input label="Company Tax ID" value={form.taxId || ''} onChange={(e) => set('taxId', e.target.value)} />
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Issuer Name (person)" value={form.contactName || ''} onChange={(e) => set('contactName', e.target.value)} />
            <Input label="Issuer Email" error={errors.contactEmail} value={form.contactEmail || ''} onChange={(e) => set('contactEmail', e.target.value)} />
            <Input label="Issuer Phone" value={form.contactPhone || ''} onChange={(e) => set('contactPhone', e.target.value)} />
            <Input label="Website" value={form.website || ''} onChange={(e) => set('website', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Logo (optional)</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={(e) => onLogoChange(e.target.files?.[0])} />
              {form.logoDataUrl ? <img src={form.logoDataUrl} alt="Logo" className="h-10 rounded" /> : <span className="text-xs text-muted-foreground">No logo uploaded</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance & Locale */}
      <Card className="max-w-4xl">
        <CardHeader><CardTitle>Appearance & Locale</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Select
            label="Currency"
            value={form.currency}
            onValueChange={(v) => set('currency', v)}
            error={errors.currency}
            options={[
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
              { label: 'INR', value: 'INR' },
              { label: 'GBP', value: 'GBP' },
              { label: 'AUD', value: 'AUD' },
              { label: 'CAD', value: 'CAD' },
            ]}
          />
          <Select
            label="Theme"
            value={form.theme}
            onValueChange={(v) => set('theme', v as SettingsForm['theme'])}
            error={errors.theme}
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]}
          />
          <Select
            label="Invoice Template"
            value={form.invoiceTemplate}
            onValueChange={(v) => set('invoiceTemplate', v as SettingsForm['invoiceTemplate'])}
            options={[
              { label: 'Simple', value: 'simple' },
              { label: 'Compact', value: 'compact' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Invoice Numbering */}
      <Card className="max-w-4xl">
        <CardHeader><CardTitle>Invoice Numbering</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Input label="Prefix (optional)" value={form.invoicePrefix || ''} onChange={(e) => set('invoicePrefix', e.target.value)} />
          <Input label="Number Width" type="number" error={errors.invoiceNumberWidth} value={form.invoiceNumberWidth ?? 5} onChange={(e) => set('invoiceNumberWidth', Number(e.target.value || 5))} />
          <Input label="Current Counter (read-only)" value={String(form.invoiceCounter ?? 0)} readOnly />
          <div className="md:col-span-3 flex gap-2">
            <Button onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
            <Button variant="secondary" onClick={resetCounter}>Reset Counter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Cloud & Data */}
      <Card className="max-w-4xl">
        <CardHeader><CardTitle>Cloud & Data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {user ? <>Signed in as {user.email}. Data syncs when online.</> : <>Not signed in. Sign in to enable cloud sync.</>}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <Switch checked={syncAuto} onCheckedChange={setSyncAuto} />
              <span className="text-sm">Auto Cloud Sync</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Interval</span>
              <input
                type="number"
                min={1}
                className="h-9 w-20 rounded-md border bg-background px-2 text-sm"
                value={syncIntervalMin}
                onChange={(e) => setSyncIntervalMin(Math.max(1, Number(e.target.value || 1)))}
              />
              <span className="text-sm">min</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSyncNow} disabled={!user || syncing}>{syncing ? 'Syncing…' : 'Sync Now'}</Button>
            <Button variant="secondary" onClick={onBackup}>Backup (Download)</Button>
            <label className="pill border px-3 py-2 cursor-pointer">
              <input type="file" accept="application/json" onChange={(e) => onRestore(e.target.files?.[0] || undefined)} className="hidden" />
              Restore from File
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Demo Data */}
      <Card className="max-w-4xl">
        <CardHeader><CardTitle>Demo</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">Seed demo company, customers, items, invoices, purchases, and payments to explore features offline.</div>
          <Button variant="ghost" onClick={onSeed}>Seed Demo Data</Button>
        </CardContent>
      </Card>
    </div>
  )
}