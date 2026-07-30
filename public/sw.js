// public/sw.js
const CACHE_VERSION = 'nuruvent-v2'

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

// Service worker install event - cache assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll([
        '/',
        '/icon-192.png',
        '/icon-512.png',
        '/favicon.ico',
        // No manifest.json here
      ])
    })
  )
})

// Clean up old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Service worker fetch event - serve from cache if offline
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request)
    })
  )
})