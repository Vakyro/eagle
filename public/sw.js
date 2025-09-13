const CACHE_NAME = "eagle-v1"
const urlsToCache = [
  "/",
  "/my-queue",
  "/admin",
  "/admin/analytics",
  "/admin/settings",
  "/settings",
  "/login",
  "/offline.html",
  "/manifest.json",
  "/icon-192.jpg",
  "/icon-512.jpg"
]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
  // Skip waiting to activate immediately
  self.skipWaiting()
})

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  // Claim clients immediately
  return self.clients.claim()
})

// Fetch event - Network first for API calls, cache first for assets
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Network first for API calls and dynamic content
  if (event.request.url.includes("/api/") || event.request.url.includes("?")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone)
            })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request)
        })
    )
    return
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      // Fetch from network and cache the response
      return fetch(event.request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      }).catch(() => {
        // If it's a navigation request and we're offline, show offline page
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
        // For other requests, return a basic offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        })
      })
    })
  )
})

// Push notification event
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Queue update available",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Queue",
        icon: "/icon-192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icon-192.png",
      },
    ],
  }

  event.waitUntil(self.registration.showNotification("Eagle", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/my-queue"))
  }
})
