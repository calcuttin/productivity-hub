// Service Worker for Push Notifications
const CACHE_NAME = 'notion-app-v1';
const STATIC_CACHE = 'notion-app-static-v1';

// VAPID Public Key - Replace with your actual public key
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI3Q3H7Uv8z1W3kzH7+L+H+0Q1HQ5P7sU4M0z7r7g8e8q2t+L3Hq0VKz4Y=';

// Convert VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/favicon.ico',
        '/manifest.json',
        '/offline.html'
      ]);
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'New Notification',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'default',
    requireInteraction: false,
    silent: false,
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload
      };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  const notificationPromise = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      image: notificationData.image,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      silent: notificationData.silent,
      data: notificationData.data,
      actions: notificationData.actions || [
        {
          action: 'view',
          title: 'View',
          icon: '/favicon.ico'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    }
  );

  event.waitUntil(notificationPromise);
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const notificationData = event.notification.data || {};
  const action = event.action || 'view';
  
  let urlToOpen = '/';
  
  if (action === 'view') {
    // Determine URL based on notification type
    if (notificationData.entityType && notificationData.entityId) {
      switch (notificationData.entityType) {
        case 'project':
          urlToOpen = `/projects/${notificationData.entityId}`;
          break;
        case 'todo':
          urlToOpen = `/todos/${notificationData.entityId}`;
          break;
        case 'research':
          urlToOpen = `/research/${notificationData.entityId}`;
          break;
        case 'workout':
          urlToOpen = `/workout/${notificationData.entityId}`;
          break;
        default:
          urlToOpen = notificationData.actionUrl || '/';
      }
    } else {
      urlToOpen = notificationData.actionUrl || '/';
    }
  } else if (action === 'dismiss') {
    // Mark notification as dismissed
    if (notificationData.notificationId) {
      fetch(`/api/notifications/${notificationData.notificationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'dismissed' })
      }).catch(error => {
        console.error('Error dismissing notification:', error);
      });
    }
    return;
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  const notificationData = event.notification.data || {};
  
  // Mark notification as read if it was closed without clicking
  if (notificationData.notificationId) {
    fetch(`/api/notifications/${notificationData.notificationId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'read' })
    }).catch(error => {
      console.error('Error marking notification as read:', error);
    });
  }
});

// Background sync for offline functionality
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data when connection is restored
    console.log('Performing background sync...');
    
    // You can add offline data sync logic here
    // For example, sync pending notifications, time tracking data, etc.
    
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache successful responses for static assets
        if (fetchResponse.status === 200 && fetchResponse.type === 'basic') {
          const responseToCache = fetchResponse.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return fetchResponse;
      }).catch(() => {
        // Return offline page for navigation requests
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
      });
    })
  );
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VAPID_PUBLIC_KEY') {
    event.ports[0].postMessage({
      type: 'VAPID_PUBLIC_KEY',
      key: VAPID_PUBLIC_KEY
    });
  }
});

console.log('Service Worker loaded successfully'); 