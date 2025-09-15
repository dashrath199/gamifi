// Service Worker registration
const CACHE_NAME = "gamified-learning-v1"
const urlsToCache = [
  "/",
  "/student/dashboard",
  "/auth/login",
  "/auth/sign-up",
  "/offline",
  "/static/js/bundle.js",
  "/static/css/main.css",
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})
