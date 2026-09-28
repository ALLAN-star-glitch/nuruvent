// public/sw.js
const CACHE_VERSION = 'nuruvent-v13' // Bumped to force the new fetch handler to activate

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
      self.clients.claim(),
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
      self.registration.showNotification(
        data.title || 'Nuruvent Notification',
        options
      )
    )
  }
})

self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(clients.openWindow(urlToOpen))
})

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url)

  // ─────────────────────────────────────────────────────────────
  // 1. NEVER INTERCEPT API TRAFFIC
  //
  // API requests carry query strings, auth cookies, methods, and
  // bodies that must reach the backend untouched. Intercepting
  // them via event.respondWith opens the door to silent bugs where
  // the SW reconstructs a URL and drops the query string.
  //
  // Returning early — without calling event.respondWith — lets the
  // browser perform the fetch natively, exactly as if the SW
  // weren't installed. This is the correct behavior for all APIs.
  // ─────────────────────────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 2. NEVER INTERCEPT CROSS-ORIGIN ASSETS
  //
  // Zoom's SDK CDN, Google Tag Manager, Cloudinary, fonts, and any
  // third-party script should bypass the SW entirely. Intercepting
  // them causes the "cross-world service worker resource mismatch"
  // preload warnings in Chrome, and can break the SDK if the SW
  // returns a cached or reconstructed version.
  // ─────────────────────────────────────────────────────────────
  if (url.origin !== self.location.origin) {
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 3. NETWORK ONLY: External third-party scripts (belt-and-braces)
  //
  // The origin check above already covers these, but keeping an
  // explicit allow-list here documents which third parties we
  // deliberately bypass. If any of them are ever served same-origin
  // via a rewrite, this guard still catches them.
  // ─────────────────────────────────────────────────────────────
  const externalDomains = [
    'tawk.to',
    'embed.tawk.to',
    'googletagmanager.com',
    'google-analytics.com',
    'googleapis.com',
    'cdn.popt.in',
    'google.com',
    'www.google.com',
    'zoom.us',
    'source.zoom.us',
  ]

  const isExternal = externalDomains.some(function (domain) {
    return url.hostname.includes(domain)
  })
  if (isExternal) {
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 4. NETWORK FIRST: Page navigations
  //
  // HTML routes always fetch fresh from the network when online,
  // falling back to cache only when offline. This guarantees users
  // get the newest deployment.
  // ─────────────────────────────────────────────────────────────
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(function (networkResponse) {
          const responseClone = networkResponse.clone()
          caches.open(CACHE_VERSION).then(function (cache) {
            cache.put(event.request, responseClone)
          })
          return networkResponse
        })
        .catch(function () {
          return caches.match(event.request)
        })
    )
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 5. CACHE FIRST: Static media and internal static assets
  //
  // Only same-origin, non-API, non-navigation requests reach here.
  // These are safe to cache — icons, images, CSS chunks, JS chunks.
  // ─────────────────────────────────────────────────────────────
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        return response
      }
      return fetch(event.request).then(function (networkResponse) {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === 'basic'
        ) {
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