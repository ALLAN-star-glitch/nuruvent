// public/sw.js
const CACHE_VERSION = 'nuruvent-v12' // Bumped version to force cache refresh

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
      // Clear out older cache versions automatically
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

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url)
  
  // 1. NETWORK ONLY: External third-party scripts
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
    event.respondWith(fetch(event.request))
    return
  }

  // 2. NETWORK FIRST: Page navigations (e.g. '/' or any HTML route)
  // Guarantees users get the newest deployment from Vercel when online.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (networkResponse) {
          // Clone and update the local cache with fresh HTML
          const responseClone = networkResponse.clone()
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(event.request, responseClone)
          })
          return networkResponse
        })
        .catch(function () {
          // Offline fallback: serve cached HTML if network fails
          return caches.match(event.request)
        })
    )
    return
  }

  // 3. CACHE FIRST: Static media and internal static assets
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response
      }
      return fetch(event.request).then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(event.request, responseClone)
          })
        }
        return networkResponse
      })
    })
  )
})