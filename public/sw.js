// public/sw.js
const CACHE_VERSION = 'nuruvent-v6'

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

// ✅ SKIP CACHING FOR EXTERNAL SCRIPTS
self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url)
  
  // Skip caching for external domains
  const externalDomains = [
    'tawk.to',
    'googletagmanager.com',
    'google-analytics.com',
    'googleapis.com',
    'cdn.popt.in',
    'embed.tawk.to',
  ]
  
  const shouldSkipCache = externalDomains.some(domain => url.hostname.includes(domain))
  
  if (shouldSkipCache) {
    // ✅ Don't cache external scripts - fetch fresh every time
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