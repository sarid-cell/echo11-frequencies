const CACHE = 'echo11-v1'

const PRECACHE = [
  '/',
  '/index.html',
  '/glassmorphism-overrides.css',
  '/manifest.json',
  '/favicon.svg',
  '/hero-poster.webp',
  '/img_home.webp',
  '/img_player.jpg',
  '/img_library.jpg',
  '/img-cta.webp',
  '/profile-hero.webp',
  '/astronaut.webp',
]

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/api/')) return

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      }).catch(() => {
        if (e.request.mode === 'navigate') return caches.match('/index.html')
      })
    })
  )
})
