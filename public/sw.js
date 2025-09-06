// public/sw.js
const CACHE = 'invoice-pro-v3'
const ASSETS = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : Promise.resolve())))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  // HTML navigations: network first, offline fallback to cached "/"
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/'))
    )
    return
  }

  // Other GET: cache-first, then network with re-cache
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req).then((res) => {
        const copy = res.clone()
        caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {})
        return res
      })
    })
  )
})