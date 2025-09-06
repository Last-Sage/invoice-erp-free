// app/settings/page.tsx
'use client'
import { useEffect, useState } from 'react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useTheme } from 'next-themes'
import { seedDemoData } from '@/lib/seed'
import { useAuth } from '@/lib/auth-client'
import { exportBackup, importBackup } from '@/lib/backup'
import { syncNow } from '@/lib/sync'


export default function SettingsPage() {
  const { setTheme } = useTheme()
  const [settings, setSettings] = useState<any>({
    id: 'settings',
    companyName: '',
    address: '',
    taxId: '',
    currency: 'USD',
    theme: 'system',
    invoiceTemplate: 'simple',
    invoicePrefix: '',
    invoiceCounter: 0,
    invoiceNumberWidth: 5,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    logoDataUrl: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => { (async () => { const s = await db.get('settings', 'settings'); if (s) setSettings(s) })() }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!settings.currency) e.currency = 'Currency is required'
    if (!settings.theme) e.theme = 'Theme is required'
    const width = Number(settings.invoiceNumberWidth || 0)
    if (isNaN(width) || width < 1 || width > 12) e.invoiceNumberWidth = 'Width must be 1-12'
    if (settings.contactEmail && !/^\S+@\S+\.\S+$/.test(settings.contactEmail)) e.contactEmail = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const save = async () => {
    if (!validate()) return
    setSaving(true)
    const saved = await db.upsert('settings', settings)
    setTheme(saved.theme || 'system')
    setSaving(false)
  }

  const resetCounter = async () => {
    const s = { ...(await db.get('settings', 'settings')), invoiceCounter: 0 }
    await db.upsert('settings', s); setSettings(s)
    alert('Invoice counter reset to 0.')
  }

  const seed = async () => {
    if (!confirm('Seed demo data? This will add ~20+ records to each section (keeps your existing data).')) return
    await seedDemoData()
    alert('Demo data seeded.')
  }

  const onLogoChange = (file?: File) => {
    if (!file) { setSettings((s: any) => ({ ...s, logoDataUrl: '' })); return }
    const reader = new FileReader()
    reader.onload = () => setSettings((s: any) => ({ ...s, logoDataUrl: String(reader.result) }))
    reader.readAsDataURL(file)
  }

  const { user } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const doSync = async () => {
    if (!user) return alert('Sign in first')
    setSyncing(true)
    try { await syncNow(user.id); alert('Sync complete') } catch (e: any) { alert('Sync failed: ' + e.message) } finally { setSyncing(false) }
  }
  const doBackup = async () => exportBackup()
  const doRestore = async (file?: File) => {
    if (!file) return
    const replace = confirm('Replace existing data with backup? Choose OK to replace, Cancel to merge.')
    await importBackup(file, { replace })
    alert('Restore complete')
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <Input label="Company / Firm Name" value={settings.companyName} onChange={(e) => setSettings((s: any) => ({ ...s, companyName: e.target.value }))} />
        <Input label="Address" value={settings.address} onChange={(e) => setSettings((s: any) => ({ ...s, address: e.target.value }))} />
        <Input label="Company Tax ID" value={settings.taxId || ''} onChange={(e) => setSettings((s: any) => ({ ...s, taxId: e.target.value }))} />

        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Issuer Name (person)" value={settings.contactName || ''} onChange={(e) => setSettings((s: any) => ({ ...s, contactName: e.target.value }))} />
          <Input label="Issuer Email" error={errors.contactEmail} value={settings.contactEmail || ''} onChange={(e) => setSettings((s: any) => ({ ...s, contactEmail: e.target.value }))} />
          <Input label="Issuer Phone" value={settings.contactPhone || ''} onChange={(e) => setSettings((s: any) => ({ ...s, contactPhone: e.target.value }))} />
          <Input label="Website" value={settings.website || ''} onChange={(e) => setSettings((s: any) => ({ ...s, website: e.target.value }))} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Logo (optional)</label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/*" onChange={(e) => onLogoChange(e.target.files?.[0])} />
            {settings.logoDataUrl && <img src={settings.logoDataUrl} alt="Logo" className="h-10 rounded" />}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Select label="Currency" value={settings.currency} onValueChange={(v) => setSettings((s: any) => ({ ...s, currency: v }))} error={errors.currency} options={[
            { label: 'USD', value: 'USD' }, { label: 'EUR', value: 'EUR' }, { label: 'INR', value: 'INR' }, { label: 'GBP', value: 'GBP' }, { label: 'AUD', value: 'AUD' }
          ]} />
          <Select label="Theme" value={settings.theme} onValueChange={(v) => setSettings((s: any) => ({ ...s, theme: v }))} error={errors.theme} options={[
            { label: 'System', value: 'system' }, { label: 'Light', value: 'light' }, { label: 'Dark', value: 'dark' }
          ]} />
          <Select label="Invoice Template" value={settings.invoiceTemplate} onValueChange={(v) => setSettings((s: any) => ({ ...s, invoiceTemplate: v }))} options={[
            { label: 'Simple', value: 'simple' }, { label: 'Compact', value: 'compact' }
          ]} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Input label="Invoice Prefix (optional)" value={settings.invoicePrefix || ''} onChange={(e) => setSettings((s: any) => ({ ...s, invoicePrefix: e.target.value }))} />
          <Input label="Number Width" type="number" error={errors.invoiceNumberWidth} value={settings.invoiceNumberWidth} onChange={(e) => setSettings((s: any) => ({ ...s, invoiceNumberWidth: Number(e.target.value) }))} />
          <Input label="Current Counter (readonly)" value={String(settings.invoiceCounter ?? 0)} readOnly />
        </div>

        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          <Button variant="secondary" onClick={resetCounter}>Reset Invoice Counter</Button>
          <Button variant="ghost" onClick={seed}>Seed Demo Data</Button>
        </div>

        <div className="border rounded-xl p-4 space-y-3">
          <div className="font-semibold">Cloud & Data</div>
          <div className="text-sm text-muted-foreground">
            {user ? <>Signed in as {user.email}. Your data will sync when online.</> : <>Not signed in. Sign in to enable cloud sync.</>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={doSync} disabled={!user || syncing}>{syncing ? 'Syncing…' : 'Sync Now'}</Button>
            <Button variant="secondary" onClick={doBackup}>Backup (Download)</Button>
            <label className="pill border px-3 py-2 cursor-pointer">
              <input type="file" accept="application/json" onChange={(e) => doRestore(e.target.files?.[0] || undefined)} className="hidden" />
              Restore from File
            </label>
          </div>
        </div>
      </CardContent>
    </Card>

  )
}