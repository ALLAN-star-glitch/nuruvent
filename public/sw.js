// public/sw.js
const CACHE_VERSION = 'nuruvent-v11'

self.addEventListener('install', function (event) {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll([
        '/',
        '/icon-192.png',
        '/icon-512.png',
        '/favicon.ico',
      ])
    })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    Promise.all([
      caches.keys().then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName !== CACHE_VERSION) {
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim()
    ])
  )
})

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: data.url || '/',
      },
    }
    event.waitUntil(
      self.registration.showNotification(data.title || 'Nuruvent Notification', options)
    )
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.openWindow(urlToOpen)
  )
})

// ✅ NETWORK ONLY for external scripts - NEVER cache them
self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url)
  
  // Network only for external domains
  const externalDomains = [
    'tawk.to',
    'embed.tawk.to',
    'googletagmanager.com',
    'google-analytics.com',
    'googleapis.com',
    'cdn.popt.in',
    'google.com',
    'www.google.com',
  ]
  
  const isExternal = externalDomains.some(domain => url.hostname.includes(domain))
  
  if (isExternal) {
    // ✅ Network only - no caching at all
    event.respondWith(fetch(event.request))
    return
  }
  
  // For internal assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request)
    })
  )
})