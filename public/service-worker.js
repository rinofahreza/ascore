const CACHE_NAME = 'laravel-pwa-v3';
const RUNTIME_CACHE = 'runtime-cache-v3';
const urlsToCache = [
    '/',
    '/build/assets/app.css',
    '/build/assets/app.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                // Try to cache all URLs, but don't fail if some fail
                return Promise.allSettled(
                    urlsToCache.map(url =>
                        cache.add(url).catch(err => {
                            console.log('Failed to cache:', url, err);
                            return null;
                        })
                    )
                );
            })
            .then(() => {
                console.log('Essential resources cached');
            })
            .catch((error) => {
                console.log('Cache error:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - improved caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip non-GET requests (POST, PUT, DELETE, etc.)
    // Cache API only supports GET requests
    if (request.method !== 'GET') {
        return;
    }

    // NEVER cache notification endpoints - always fetch fresh
    if (url.pathname.startsWith('/notifications')) {
        event.respondWith(
            fetch(request, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            })
        );
        return;
    }

    // Check if this is an Inertia request
    const isInertiaRequest = request.headers.get('X-Inertia') === 'true';

    // Inertia requests - Network first, fallback to cache
    if (isInertiaRequest) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache successful Inertia responses
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('Serving cached Inertia response for:', url.pathname);
                            return cachedResponse;
                        }
                        // If no cache, return error response
                        console.log('No cached Inertia response for:', url.pathname);
                        return new Response(
                            JSON.stringify({
                                component: 'Error',
                                props: {
                                    error: 'Offline',
                                    message: 'Halaman ini belum pernah dibuka sebelumnya. Silakan coba lagi saat online.'
                                }
                            }),
                            {
                                status: 503,
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Inertia': 'true'
                                }
                            }
                        );
                    });
                })
        );
        return;
    }

    // API requests - Network first, fallback to cache
    if (url.pathname.startsWith('/api/') || url.pathname.includes('/sanctum/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone and cache successful responses
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Network failed, try cache
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Return a custom offline response for API calls
                        return new Response(
                            JSON.stringify({
                                error: 'Offline',
                                message: 'Tidak ada koneksi internet'
                            }),
                            {
                                status: 503,
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                    });
                })
        );
        return;
    }

    // Navigation requests - Network first, fallback to cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Cache successful navigation responses
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                            // Also cache as root for offline startup
                            if (url.pathname === '/' || url.pathname === '') {
                                cache.put(new Request('/'), responseToCache.clone());
                            }
                        });
                    }
                    return response;
                })
                .catch(() => {
                    console.log('Navigation offline, trying cache for:', url.pathname);
                    // Try exact match first
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('Serving cached page:', url.pathname);
                            return cachedResponse;
                        }
                        // Fallback to cached root for offline startup
                        console.log('No cached page, serving root');
                        return caches.match('/').then((rootResponse) => {
                            if (rootResponse) {
                                return rootResponse;
                            }
                            // Last resort: try static cache
                            return caches.match('/', { cacheName: CACHE_NAME });
                        });
                    });
                })
        );
        return;
    }

    // Static assets - Cache first, fallback to network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(request).then((response) => {
                    // Cache successful responses
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(request, responseToCache);
                        });
                    }
                    return response;
                });
            })
            .catch(() => {
                // Return cached version if available
                return caches.match(request);
            })
    );
});
