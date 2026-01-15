// QuickBid Service Worker - Enhanced caching and offline support

const CACHE_NAME = 'quickbid-v1.0.0';
const STATIC_CACHE = 'quickbid-static-v1';
const DYNAMIC_CACHE = 'quickbid-dynamic-v1';
const API_CACHE = 'quickbid-api-v1';

// Cache configuration
const CACHE_CONFIG = {
  static: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxEntries: 100,
  },
  dynamic: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    maxEntries: 50,
  },
  api: {
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 100,
  },
};

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other critical static assets
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Clearing old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle different request types
  if (url.origin === self.location.origin) {
    // Static assets - cache first
    if (isStaticAsset(request.url)) {
      event.respondWith(cacheFirst(request, STATIC_CACHE));
    }
    // API calls - network first with cache fallback
    else if (isAPIRequest(request.url)) {
      event.respondWith(networkFirst(request, API_CACHE));
    }
    // Dynamic pages - stale while revalidate
    else {
      event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
    }
  }
  // External requests - network only
  else {
    event.respondWith(networkOnly(request));
  }
});

// Check if request is for static asset
function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i.test(url);
}

// Check if request is for API
function isAPIRequest(url) {
  return url.includes('/api/') || url.includes('/supabase/');
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first failed:', error);
    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Stale while revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Network only strategy
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('Network request failed:', error);
    return new Response('Offline - Network unavailable', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions like bids, messages, etc.
  try {
    const offlineActions = await getOfflineActions();
    for (const action of offlineActions) {
      try {
        await fetch(action.url, action.options);
        await removeOfflineAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('QuickBid', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('https://quickbid.example.com')
    );
  }
});

// Utility functions for offline storage
async function getOfflineActions() {
  // This would typically use IndexedDB
  return [];
}

async function removeOfflineAction(id) {
  // Remove action from offline storage
  console.log('Removing offline action:', id);
}

// Cache cleanup
async function cleanupCache(cacheName, maxAge, maxEntries) {
  const cache = await caches.open(cacheName);
  const requests = await cache.keys();
  const now = Date.now();
  
  // Remove expired entries
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const date = response.headers.get('date');
      if (date && (now - new Date(date).getTime()) > maxAge) {
        await cache.delete(request);
      }
    }
  }
  
  // Remove oldest entries if too many
  const updatedRequests = await cache.keys();
  if (updatedRequests.length > maxEntries) {
    const toDelete = updatedRequests.slice(0, updatedRequests.length - maxEntries);
    await Promise.all(toDelete.map(request => cache.delete(request)));
  }
}

// Periodic cache cleanup
setInterval(() => {
  cleanupCache(STATIC_CACHE, CACHE_CONFIG.static.maxAge, CACHE_CONFIG.static.maxEntries);
  cleanupCache(DYNAMIC_CACHE, CACHE_CONFIG.dynamic.maxAge, CACHE_CONFIG.dynamic.maxEntries);
  cleanupCache(API_CACHE, CACHE_CONFIG.api.maxAge, CACHE_CONFIG.api.maxEntries);
}, 60 * 60 * 1000); // Every hour

console.log('Service Worker: Loaded');
