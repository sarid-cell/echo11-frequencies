const CACHE = 'echo11-v4'

const PRECACHE = [
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

// Extensions that change rarely — cache-first is safe and fast
const CACHE_FIRST_EXT = new Set(['.webp','.jpg','.jpeg','.png','.gif','.svg','.ico','.woff','.woff2'])

function isCacheFirst(url) {
  const ext = url.pathname.match(/(\.[^./?#]+)($|\?)/)?.[1] || ''
  return CACHE_FIRST_EXT.has(ext.toLowerCase())
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/api/')) return

  // Media / fonts — cache-first (large, never change after deploy)
  if (isCacheFirst(url)) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(res => {
          if (!res || res.status !== 200 || res.type === 'opaque') return res
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
          return res
        })
      })
    )
    return
  }

  // HTML, JS, CSS, JSON — network-first so every deploy reaches users immediately
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then(cached => cached || caches.match('/index.html')))
  )
})
