// public/sw.js
const CACHE_VERSION = 'nuruvent-v16' // bumped: /_next/ bypass + image optimizer fix

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
      // Delete every cache that isn't the current version.
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
  event.notification.close()
  const urlToOpen = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(urlToOpen))
})

self.addEventListener('fetch', function (event) {
  const url = new URL(event.request.url)

  // ─────────────────────────────────────────────────────────────
  // 0. NEVER INTERCEPT NEXT.JS BUILD OUTPUT OR IMAGE OPTIMIZER
  //
  // /_next/image is header-sensitive: it reads the Accept header
  // to choose AVIF/WebP/JPEG and rejects requests whose headers
  // look malformed. SW interception strips or rewrites the
  // Accept header and Next.js returns 400.
  //
  // /_next/static/* is content-hashed and immutable. The browser's
  // HTTP cache already handles it correctly. SW caching it adds
  // no value and creates the "only works after hard refresh" class
  // of bug we've been chasing.
  // ─────────────────────────────────────────────────────────────
  if (url.pathname.startsWith('/_next/')) {
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 1. NEVER INTERCEPT API TRAFFIC
  //
  // User-scoped data. Caching leaks between logins and serves
  // stale responses after mutations.
  // ─────────────────────────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 2. NEVER INTERCEPT USER-SCOPED HTML ROUTES
  //
  // Dashboard, auth, and meeting pages are per-user. A cached
  // copy served to a different user leaks the previous session.
  // ─────────────────────────────────────────────────────────────
  if (
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/meeting') ||
    url.pathname === '/login' ||
    url.pathname === '/register'
  ) {
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 3. NEVER INTERCEPT CROSS-ORIGIN ASSETS
  //
  // Zoom SDK, Google Tag Manager, Cloudinary, fonts, Supabase
  // storage — all load from their own origin without SW
  // interference. Also avoids Chrome's "cross-world service
  // worker resource mismatch" preload warnings.
  // ─────────────────────────────────────────────────────────────
  if (url.origin !== self.location.origin) {
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 4. EXPLICIT EXTERNAL ALLOW-LIST (belt-and-braces)
  //
  // The origin check above already covers these, but keeping an
  // explicit list documents which third parties bypass the SW
  // even if a rewrite ever makes them same-origin.
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
    'supabase.co',
  ]

  const isExternal = externalDomains.some(function (domain) {
    return url.hostname.includes(domain)
  })
  if (isExternal) {
    return
  }

  // ─────────────────────────────────────────────────────────────
  // 5. NETWORK FIRST: Page navigations
  //
  // Only public, non-user-scoped HTML reaches here (landing page,
  // marketing pages, etc.). Always fresh from the network when
  // online; cache is only a fallback for offline.
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
  // 6. CACHE FIRST: Static assets only
  //
  // By this point, only same-origin, non-API, non-user-scoped,
  // non-Next-build requests reach here. These are safe to cache:
  // images under /images/, icons, fonts, manifest.
  // ─────────────────────────────────────────────────────────────
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) return response
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