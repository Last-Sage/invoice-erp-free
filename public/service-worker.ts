// public/service-worker.ts
// Basic offline cache for static assets + navigation fallback
const CACHE = 'invoice-pro-v1'
const ASSETS = [
  '/', '/manifest.json'
]

self.addEventListener('install', (event: any) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => (self as any).skipWaiting()))
})

self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE ? caches.delete(k) : Promise.resolve()))).then(() => (self as any).clients.claim())
  )
})

self.addEventListener('fetch', (event: any) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {})
        return res
      }).catch(() => {
        // navigation fallback for offline
        if (req.mode === 'navigate') return caches.match('/')
        throw new Error('Network error')
      })
    })
  )
})