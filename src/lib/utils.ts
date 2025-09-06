// lib/utils.ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function getSettingsFromLS(): any {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem('invoice-pro:settings')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function currentCurrency() {
  const s = getSettingsFromLS()
  return s.currency || 'USD'
}

export const formatCurrency = (n: number, currency?: string, locale?: string) =>
  new Intl.NumberFormat(locale || (typeof navigator !== 'undefined' ? navigator.language : 'en-US'), {
    style: 'currency',
    currency: currency || currentCurrency()
  }).format(n)

export const uid = () =>
  (globalThis.crypto?.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2))