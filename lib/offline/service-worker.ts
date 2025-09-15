// Service Worker for offline functionality
const CACHE_NAME = "gamified-learning-v1";
const STATIC_CACHE_URLS = ["/", "/student/dashboard", "/auth/login", "/auth/sign-up", "/offline"];

// Install event - cache static resources
self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(STATIC_CACHE_URLS);
    }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  );
});

// Fetch event - serve from cache when offline, with a network-first strategy for other resources
self.addEventListener("fetch", (event: any) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((fetchResponse) => {
        // Cache successful responses
        if (fetchResponse.status === 200) {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      })
      .catch(() => {
        // If the network fails, try to serve from cache
        return caches.match(event.request).then((response) => {
          // If in cache, return it
          if (response) {
            return response;
          }
          // For navigation requests, return the offline page if nothing is cached
          if (event.request.mode === "navigate") {
            return caches.match("/offline");
          }
        });
      }),
  );
});


// Background sync for offline data
self.addEventListener("sync", (event: any) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB
    const offlineData = await getOfflineData();

    // Sync each item
    for (const item of offlineData) {
      try {
        await syncDataItem(item);
        await removeOfflineData(item.id);
      } catch (error) {
        console.error("Failed to sync item:", item.id, error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

async function getOfflineData(): Promise<any[]> {
  // This would typically use IndexedDB
  // This is a placeholder and needs to be implemented
  console.log("Fetching offline data for sync...");
  return [];
}

async function syncDataItem(item: any): Promise<void> {
  // Sync individual data item to server
  console.log("Syncing item:", item);
  const response = await fetch("/api/sync", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });

  if (!response.ok) {
    throw new Error("Sync failed");
  }
}

async function removeOfflineData(id: string): Promise<void> {
  // Remove synced data from local storage
  // This is a placeholder and needs to be implemented
  console.log("Removing synced data:", id);
}