const CACHE_NAME = 'nias-ib-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/main.js'
];

// تثبيت الـ Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// العمل بدون إنترنت
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});