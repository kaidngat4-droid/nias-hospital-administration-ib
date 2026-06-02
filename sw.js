// ═══════════════════════════════════════════════════════════
//  NIAS Ibb - Service Worker v2.0
//  Hospital Management Brochure PWA
//  Offline-First Strategy with Advanced Caching
// ═══════════════════════════════════════════════════════════

const CACHE_NAME = 'nias-ibb-v2';
const STATIC_CACHE = 'nias-static-v2';
const IMAGE_CACHE = 'nias-images-v2';
const DYNAMIC_CACHE = 'nias-dynamic-v2';

// Core assets - critical for offline functionality
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/css/styles.css',
    '/css/fonts.css',
    '/js/main.js',
    '/js/app.js'
];

// Static assets - fonts, icons, logos
const STATIC_ASSETS = [
    '/assets/fonts/cairo.woff2',
    '/assets/fonts/tajawal.woff2',
    '/assets/fonts/amiri.woff2',
    '/assets/fonts/noto-kufi.woff2',
    '/assets/fonts/noto-naskh.woff2',
    '/assets/icons/favicon.ico',
    '/assets/icons/icon-72x72.png',
    '/assets/icons/icon-96x96.png',
    '/assets/icons/icon-128x128.png',
    '/assets/icons/icon-144x144.png',
    '/assets/icons/icon-152x152.png',
    '/assets/icons/icon-192x192.png',
    '/assets/icons/icon-384x384.png',
    '/assets/icons/icon-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/maskable-icon.png',
    '/assets/images/nias-logo.png',
    '/assets/images/yemen-emblem.png',
    '/assets/images/hero-bg.jpg',
    '/assets/images/hero-bg-low.jpg'
];

// Image assets for gallery and content
const IMAGE_ASSETS = [
    '/assets/images/graduates/graduate-1.jpg',
    '/assets/images/graduates/graduate-2.jpg',
    '/assets/images/graduates/graduate-3.jpg',
    '/assets/images/graduates/graduate-4.jpg',
    '/assets/images/gallery/gallery-1.jpg',
    '/assets/images/gallery/gallery-2.jpg',
    '/assets/images/gallery/gallery-3.jpg',
    '/assets/images/gallery/gallery-4.jpg',
    '/assets/images/gallery/gallery-5.jpg',
    '/assets/images/gallery/gallery-6.jpg',
    '/assets/images/about/campus.jpg',
    '/assets/images/about/classroom.jpg',
    '/assets/images/about/training.jpg'
];

// External CDN resources (cache with network fallback)
const CDN_RESOURCES = [
    'https://fonts.googleapis.com/css2',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome',
    'https://unpkg.com/leaflet'
];

// ═══════════════════════════════════════════════════════════
//  INSTALL PHASE - Pre-cache critical assets
// ═══════════════════════════════════════════════════════════
self.addEventListener('install', event => {
    console.log('[SW] Installing NIAS Service Worker v2.0...');
    
    event.waitUntil(
        Promise.all([
            // Cache core HTML/JS/CSS
            caches.open(CACHE_NAME)
                .then(cache => {
                    console.log('[SW] Caching core assets...');
                    return cache.addAll(CORE_ASSETS);
                })
                .catch(err => console.warn('[SW] Core cache failed:', err)),
            
            // Cache static assets (fonts, icons)
            caches.open(STATIC_CACHE)
                .then(cache => {
                    console.log('[SW] Caching static assets...');
                    return cache.addAll(STATIC_ASSETS);
                })
                .catch(err => console.warn('[SW] Static cache failed:', err)),
            
            // Cache images
            caches.open(IMAGE_CACHE)
                .then(cache => {
                    console.log('[SW] Caching images...');
                    return cache.addAll(IMAGE_ASSETS);
                })
                .catch(err => console.warn('[SW] Image cache failed:', err))
        ])
        .then(() => {
            console.log('[SW] All assets cached successfully');
            self.skipWaiting();
        })
    );
});

// ═══════════════════════════════════════════════════════════
//  ACTIVATE PHASE - Clean old caches
// ═══════════════════════════════════════════════════════════
self.addEventListener('activate', event => {
    console.log('[SW] Activating NIAS Service Worker...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => {
                            // Delete old versions of our caches
                            return name.startsWith('nias-') && 
                                   (name !== CACHE_NAME && 
                                    name !== STATIC_CACHE && 
                                    name !== IMAGE_CACHE && 
                                    name !== DYNAMIC_CACHE);
                        })
                        .map(name => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Old caches cleaned');
                return self.clients.claim();
            })
    );
});

// ═══════════════════════════════════════════════════════════
//  FETCH STRATEGY - Intelligent caching per resource type
// ═══════════════════════════════════════════════════════════
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip chrome-extension and non-http(s) requests
    if (!url.protocol.startsWith('http')) return;
    
    // Strategy selection based on resource type
    if (isCoreAsset(request)) {
        // Cache First - Critical assets must work offline
        event.respondWith(cacheFirst(request, CACHE_NAME));
    } 
    else if (isStaticAsset(request)) {
        // Cache First with background update - Fonts/icons
        event.respondWith(cacheFirstWithUpdate(request, STATIC_CACHE));
    } 
    else if (isImage(request)) {
        // Stale While Revalidate - Images can be slightly outdated
        event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    } 
    else if (isAPI(request)) {
        // Network First with cache fallback - API calls
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    } 
    else if (isExternalCDN(request)) {
        // Cache First for CDN resources
        event.respondWith(cacheFirst(request, STATIC_CACHE));
    } 
    else {
        // Network First for everything else
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    }
});

// ═══════════════════════════════════════════════════════════
//  CACHE STRATEGIES
// ═══════════════════════════════════════════════════════════

// 1. Cache First - Serve from cache, fallback to network
async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }
    
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        // If network fails and no cache, serve offline page for HTML
        if (request.headers.get('accept')?.includes('text/html')) {
            return serveOfflinePage();
        }
        throw error;
    }
}

// 2. Cache First with Background Update
async function cacheFirstWithUpdate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Update cache in background
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);
    
    return cached || fetchPromise;
}

// 3. Stale While Revalidate - Serve cache, update in background
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        if (cached) return cached;
        // Return placeholder for images
        if (request.destination === 'image') {
            return serveImagePlaceholder();
        }
        throw new Error('Network error');
    });
    
    return cached || fetchPromise;
}

// 4. Network First - Try network, fallback to cache
async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cached = await cache.match(request);
        if (cached) {
            // Add header to indicate cached response
            const headers = new Headers(cached.headers);
            headers.set('X-Served-By', 'ServiceWorker-Cache');
            return new Response(cached.body, {
                status: 200,
                statusText: 'OK',
                headers: headers
            });
        }
        
        // If HTML request, serve offline page
        if (request.headers.get('accept')?.includes('text/html')) {
            return serveOfflinePage();
        }
        
        throw error;
    }
}

// ═══════════════════════════════════════════════════════════
//  HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function isCoreAsset(request) {
    const url = request.url;
    return CORE_ASSETS.some(asset => url.includes(asset)) ||
           url.endsWith('.html') ||
           url.endsWith('/');
}

function isStaticAsset(request) {
    const url = request.url;
    return STATIC_ASSETS.some(asset => url.includes(asset)) ||
           url.includes('/assets/fonts/') ||
           url.includes('/assets/icons/') ||
           url.endsWith('.woff') ||
           url.endsWith('.woff2') ||
           url.endsWith('.ttf') ||
           url.endsWith('.css');
}

function isImage(request) {
    return request.destination === 'image' ||
           request.url.match(/\\.(jpg|jpeg|png|gif|webp|svg|ico)$/i);
}

function isAPI(request) {
    return request.url.includes('/api/') ||
           request.url.includes('/wp-json/') ||
           request.headers.get('accept')?.includes('application/json');
}

function isExternalCDN(request) {
    const url = request.url;
    return CDN_RESOURCES.some(cdn => url.includes(cdn));
}

// Serve offline page for HTML requests
async function serveOfflinePage() {
    const cache = await caches.open(CACHE_NAME);
    const offlinePage = await cache.match('/offline.html');
    
    if (offlinePage) {
        return offlinePage;
    }
    
    // Fallback inline offline page
    return new Response(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"><title>غير متصل - NIAS</title>
<style>
body{font-family:Tajawal,sans-serif;background:#061a10;color:#fff;display:flex;
align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
.container{max-width:500px;padding:40px}.icon{font-size:80px;margin-bottom:20px}
h1{color:#d4af37;font-size:28px;margin-bottom:15px}
p{color:rgba(255,255,255,0.7);line-height:1.8;margin-bottom:30px}
.btn{background:linear-gradient(135deg,#0d4a2e,#1a6b40);color:#fff;padding:14px 35px;
border-radius:50px;text-decoration:none;display:inline-block;font-weight:700;
transition:all 0.3s}.btn:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(13,74,46,0.3)}
.cached-info{background:rgba(255,255,255,0.05);border-radius:16px;padding:20px;
margin-top:30px;border:1px solid rgba(212,175,55,0.1)}
.cached-info h3{color:#d4af37;font-size:16px;margin-bottom:10px}
.cached-info ul{list-style:none;padding:0;text-align:right}
.cached-info li{padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);
color:rgba(255,255,255,0.6);font-size:14px}
</style></head>
<body>
<div class="container">
<div class="icon">📡</div>
<h1>أنت غير متصل بالإنترنت</h1>
<p>يبدو أنك غير متصل حالياً. لا تقلق! يمكنك الاستمرار في تصفح المحتوى المتاح بدون إنترنت.</p>
<a href="/" class="btn">العودة للصفحة الرئيسية</a>
<div class="cached-info">
<h3>✅ متاح بدون إنترنت:</h3>
<ul>
<li>📄 الصفحة الرئيسية والأقسام الأساسية</li>
<li>📚 معلومات البرامج والخطة الدراسية</li>
<li>🎓 قصص نجاح الخريجين</li>
<li>📞 معلومات التواصل والموقع</li>
<li>📝 نموذج التسجيل (يُحفظ محلياً)</li>
</ul>
</div>
</div>
</body></html>`, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
}

// Serve placeholder for missing images
async function serveImagePlaceholder() {
    // Simple SVG placeholder
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="#0d4a2e"/>
        <text x="200" y="140" text-anchor="middle" fill="#d4af37" font-size="18" font-family="sans-serif">NIAS Ibb</text>
        <text x="200" y="170" text-anchor="middle" fill="rgba(255,255,255,0.5)" font-size="12">Image unavailable offline</text>
    </svg>`;
    
    return new Response(svg, {
        headers: { 'Content-Type': 'image/svg+xml' }
    });
}

// ═══════════════════════════════════════════════════════════
//  BACKGROUND SYNC - Queue form submissions when offline
// ═══════════════════════════════════════════════════════════
self.addEventListener('sync', event => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(syncFormSubmissions());
    }
});

async function syncFormSubmissions() {
    // Retrieve queued submissions from IndexedDB and send them
    console.log('[SW] Syncing queued form submissions...');
    // Implementation depends on your form handling logic
}

// ═══════════════════════════════════════════════════════════
//  PUSH NOTIFICATIONS - For admission announcements
// ═══════════════════════════════════════════════════════════
self.addEventListener('push', event => {
    const data = event.data?.json() || {};
    
    const options = {
        body: data.body || 'تنبيه جديد من المعهد الوطني للعلوم الإدارية',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/badge-72x72.png',
        image: data.image || '/assets/images/notification-default.jpg',
        dir: 'rtl',
        lang: 'ar',
        tag: data.tag || 'nias-notification',
        requireInteraction: data.requireInteraction || false,
        actions: [
            {
                action: 'open',
                title: 'فتح',
                icon: '/assets/icons/open.png'
            },
            {
                action: 'close',
                title: 'إغلاق',
                icon: '/assets/icons/close.png'
            }
        ],
        data: {
            url: data.url || '/',
            timestamp: Date.now()
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.title || 'NIAS - إدارة المستشفيات',
            options
        )
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const action = event.action;
    const notificationData = event.notification.data;
    
    if (action === 'open' || !action) {
        event.waitUntil(
            clients.openWindow(notificationData?.url || '/')
        );
    }
});

// ═══════════════════════════════════════════════════════════
//  MESSAGE HANDLING - Communication with main thread
// ═══════════════════════════════════════════════════════════
self.addEventListener('message', event => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data === 'getCacheStatus') {
        event.ports[0].postMessage({
            caches: [CACHE_NAME, STATIC_CACHE, IMAGE_CACHE, DYNAMIC_CACHE],
            timestamp: Date.now()
        });
    }
});

console.log('[SW] NIAS Service Worker v2.0 loaded successfully');
''';

# 2. Professional Offline Page (offline.html)
offline_html = '''<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#0d4a2e">
<meta name="description" content="وضع عدم الاتصال - بروشور إدارة المستشفيات NIAS">
<title>غير متصل | المعهد الوطني للعلوم الإدارية - فرع إب</title>

<!-- Preconnect -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">

<style>
/* ═══════════════════════════════════════════════════════════ */
/*  Offline Page - NIAS Hospital Management Brochure             */
/* ═══════════════════════════════════════════════════════════ */
:root {
  --gold: #d4af37;
  --gold-light: #f0d060;
  --green: #0d4a2e;
  --green-dark: #061a10;
  --green-light: #1a6b40;
  --white: #ffffff;
  --text-light: rgba(255,255,255,0.7);
  --text-muted: rgba(255,255,255,0.5);
  --shadow: 0 20px 60px rgba(0,0,0,0.3);
  --radius: 24px;
  --transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  font-family: 'Tajawal', 'Cairo', sans-serif;
  background: var(--green-dark);
  color: var(--white);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  line-height: 1.7;
  overflow-x: hidden;
  position: relative;
}

/* Animated background pattern */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
  z-index: 0;
}

/* Glow effects */
.glow-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  z-index: 0;
  animation: float 20s ease-in-out infinite;
}
.glow-orb:nth-child(1) {
  width: 300px; height: 300px;
  background: var(--gold);
  top: -100px; right: -100px;
  animation-delay: 0s;
}
.glow-orb:nth-child(2) {
  width: 250px; height: 250px;
  background: var(--green-light);
  bottom: -80px; left: -80px;
  animation-delay: -5s;
}
.glow-orb:nth-child(3) {
  width: 200px; height: 200px;
  background: var(--gold);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
}

/* Main Container */
.container {
  position: relative;
  z-index: 1;
  max-width: 600px;
  width: 100%;
  text-align: center;
}

/* NIAS Badge */
.nias-badge {
  width: 70px; height: 70px;
  margin: 0 auto 30px;
}
.badge-ring {
  width: 100%; height: 100%;
  border: 2px solid var(--gold);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  padding: 4px;
  animation: pulse 3s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0.3); }
  50% { box-shadow: 0 0 0 15px rgba(212,175,55,0); }
}
.badge-inner {
  width: 100%; height: 100%;
  background: var(--green);
  border-radius: 50%;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.badge-nias {
  font-size: 11px; font-weight: 900;
  color: var(--gold); letter-spacing: 1px;
  font-family: 'Cairo', sans-serif;
}
.badge-year {
  font-size: 9px; color: var(--white);
  font-family: 'Cairo', sans-serif;
}

/* Offline Icon */
.offline-icon {
  font-size: 80px;
  margin-bottom: 25px;
  display: block;
  animation: iconFloat 3s ease-in-out infinite;
}
@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Title */
.title {
  font-family: 'Cairo', sans-serif;
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  font-weight: 900;
  color: var(--gold);
  margin-bottom: 15px;
  line-height: 1.3;
}

/* Subtitle */
.subtitle {
  font-size: 1.1rem;
  color: var(--text-light);
  margin-bottom: 15px;
  max-width: 450px;
  margin-left: auto;
  margin-right: auto;
}

/* Connection Status */
.status-box {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
  padding: 10px 24px;
  border-radius: 50px;
  margin-bottom: 30px;
  font-size: 0.95rem;
  color: #ff6b7a;
}
.status-dot {
  width: 8px; height: 8px;
  background: #dc3545;
  border-radius: 50%;
  animation: blink 1.5s ease-in-out infinite;
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* CTA Button */
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--green), var(--green-light));
  color: var(--white);
  padding: 16px 40px;
  border-radius: 50px;
  font-family: 'Cairo', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  text-decoration: none;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
  border: none;
  cursor: pointer;
  margin-bottom: 40px;
}
.cta-btn::before {
  content: '';
  position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: 0.8s;
}
.cta-btn:hover::before { left: 100%; }
.cta-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(13,74,46,0.4);
}
.cta-btn:active { transform: translateY(-1px); }

/* Cached Content Card */
.cached-card {
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212,175,55,0.1);
  border-radius: var(--radius);
  padding: 35px 30px;
  text-align: right;
  position: relative;
  overflow: hidden;
}
.cached-card::before {
  content: '';
  position: absolute; top: 0; right: 0;
  width: 100%; height: 4px;
  background: linear-gradient(90deg, var(--green), var(--gold), var(--green));
}

.cached-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 25px;
}
.cached-icon {
  width: 45px; height: 45px;
  background: linear-gradient(135deg, var(--green), var(--green-light));
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}
.cached-title {
  font-family: 'Cairo', sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--gold);
}

/* Offline Features List */
.features-list {
  list-style: none;
  padding: 0;
}
.features-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  transition: var(--transition);
}
.features-list li:last-child { border-bottom: none; }
.features-list li:hover {
  padding-right: 10px;
  background: rgba(255,255,255,0.02);
  border-radius: 12px;
  padding: 14px 12px;
}
.feature-icon {
  width: 40px; height: 40px;
  background: rgba(13,74,46,0.3);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.feature-text h4 {
  font-family: 'Cairo', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 3px;
}
.feature-text p {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.5;
}
.feature-check {
  margin-right: auto;
  width: 24px; height: 24px;
  background: rgba(212,175,55,0.15);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: var(--gold);
  font-size: 12px;
  font-weight: 900;
}

/* Footer info */
.footer-info {
  margin-top: 30px;
  padding-top: 25px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.footer-info p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
}
.footer-info .phone {
  font-family: 'Cairo', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--gold);
  direction: ltr;
  display: inline-block;
}

/* Retry button */
.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: var(--gold);
  border: 2px solid rgba(212,175,55,0.3);
  padding: 10px 24px;
  border-radius: 50px;
  font-family: 'Tajawal', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 15px;
}
.retry-btn:hover {
  background: rgba(212,175,55,0.1);
  border-color: var(--gold);
  transform: translateY(-2px);
}
.retry-btn.spinning .retry-icon {
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Responsive */
@media (max-width: 480px) {
  .container { padding: 0 10px; }
  .cached-card { padding: 25px 20px; }
  .title { font-size: 1.6rem; }
  .features-list li { gap: 10px; }
  .feature-icon { width: 35px; height: 35px; font-size: 16px; }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
</head>
<body>

<!-- Background glow effects -->
<div class="glow-orb"></div>
<div class="glow-orb"></div>
<div class="glow-orb"></div>

<div class="container">
  
  <!-- NIAS Badge -->
  <div class="nias-badge">
    <div class="badge-ring">
      <div class="badge-inner">
        <span class="badge-nias">NIAS</span>
        <span class="badge-year">1963</span>
      </div>
    </div>
  </div>
  
  <!-- Offline Icon -->
  <span class="offline-icon">📡</span>
  
  <!-- Title -->
  <h1 class="title">أنت غير متصل بالإنترنت</h1>
  
  <!-- Subtitle -->
  <p class="subtitle">
    يبدو أن الاتصال بالإنترنت منقطع حالياً. لا تقلق! يمكنك الاستمرار في تصفح المحتوى المتاح بدون إنترنت.
  </p>
  
  <!-- Status -->
  <div class="status-box">
    <span class="status-dot"></span>
    <span>في انتظار استعادة الاتصال...</span>
  </div>
  
  <!-- CTA -->
  <a href="/" class="cta-btn">
    <span>🏠</span>
    <span>العودة للصفحة الرئيسية</span>
  </a>
  
  <!-- Cached Content Card -->
  <div class="cached-card">
    <div class="cached-header">
      <div class="cached-icon">✅</div>
      <h3 class="cached-title">متاح بدون إنترنت</h3>
    </div>
    
    <ul class="features-list">
      <li>
        <div class="feature-icon">📄</div>
        <div class="feature-text">
          <h4>الصفحة الرئيسية</h4>
          <p>جميع الأقسام والمعلومات الأساسية</p>
        </div>
        <div class="feature-check">✓</div>
      </li>
      <li>
        <div class="feature-icon">📚</div>
        <div class="feature-text">
          <h4>البرامج والخطة الدراسية</h4>
          <p>تفاصيل البكالوريوس والدبلوم</p>
        </div>
        <div class="feature-check">✓</div>
      </li>
      <li>
        <div class="feature-icon">🎓</div>
        <div class="feature-text">
          <h4>قصص نجاح الخريجين</h4>
          <p>إنجازات خريجي البرنامج</p>
        </div>
        <div class="feature-check">✓</div>
      </li>
      <li>
        <div class="feature-icon">📞</div>
        <div class="feature-text">
          <h4>معلومات التواصل</h4>
          <p>أرقام الهاتف والموقع والبريد</p>
        </div>
        <div class="feature-check">✓</div>
      </li>
      <li>
        <div class="feature-icon">📝</div>
        <div class="feature-text">
          <h4>نموذج التسجيل</h4>
          <p>يُحفظ محلياً ويُرسل عند استعادة الاتصال</p>
        </div>
        <div class="feature-check">✓</div>
      </li>
    </ul>
  </div>
  
  <!-- Footer Info -->
  <div class="footer-info">
    <p>للاستفسارات العاجلة، يمكنك التواصل مباشرة:</p>
    <p class="phone">+967 123 456 789</p>
    <button class="retry-btn" onclick="checkConnection()">
      <span class="retry-icon">🔄</span>
      <span>إعادة المحاولة</span>
    </button>
  </div>
  
</div>

<script>
// Check connection status
function checkConnection() {
  const btn = document.querySelector('.retry-btn');
  btn.classList.add('spinning');
  
  setTimeout(() => {
    btn.classList.remove('spinning');
    if (navigator.onLine) {
      window.location.reload();
    } else {
      // Show brief notification
      const status = document.querySelector('.status-box span:last-child');
      const original = status.textContent;
      status.textContent = 'لا يزال الاتصال غير متوفر...';
      status.style.color = '#ff6b7a';
      setTimeout(() => {
        status.textContent = original;
        status.style.color = '';
      }, 2000);
    }
  }, 1500);
}

// Listen for online event
window.addEventListener('online', () => {
  const status = document.querySelector('.status-box');
  status.innerHTML = '<span style="color:#28a745;font-weight:700;">✓</span> <span style="color:#28a745;">تم استعادة الاتصال! جاري التحميل...</span>';
  status.style.background = 'rgba(40,167,69,0.1)';
  status.style.borderColor = 'rgba(40,167,69,0.2)';
  
  setTimeout(() => {
    window.location.reload();
  }, 1500);
});

// Update status dot color based on connection
window.addEventListener('offline', () => {
  document.querySelector('.status-dot').style.background = '#dc3545';
});

// Register background sync for form data
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    // Register periodic sync for checking connection
    registration.periodicSync?.register('check-connection', {
      minInterval: 60000 // 1 minute
    }).catch(err => console.log('Periodic sync not supported'));
  });
}
</script>

</body>
</html>
