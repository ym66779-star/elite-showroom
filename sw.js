const CACHE_NAME = 'abu-bahaa-showroom-v9';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './logo.jpg',
  './css/theme.css',
  './css/components.css',
  './css/print.css',
  './js/config.js',
  './js/storage.js',
  './js/models.js',
  './js/auth.js',
  './js/repository.js',
  './js/firebase.js',
  './js/print-engine.js',
  './js/ui-catalog.js',
  './js/ui-car-details.js',
  './js/ui-customer-modals.js',
  './js/ui-admin-drawer.js',
  './js/ui-admin-tools.js',
  './js/app.js'
];

// 1. تثبيت التحديث الجديد فوراً بدون انتظار إغلاق المتصفح
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. مسح جميع نسخ الكاش القديمة تلقائياً وتفعيل النسخة v9 على كل الأجهزة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3. استراتيجية (الشبكة أولاً ثم الكاش) لضمان ظهور أي تعديل جديد فوراً
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // استبعاد الطلبات غير القياسية وطلبات Firebase وQR لضمان المزامنة اللحظية
  if (
    req.method !== 'GET' ||
    !req.url.startsWith('http') ||
    req.url.includes('firestore.googleapis.com') ||
    req.url.includes('firebasestorage.googleapis.com') ||
    req.url.includes('gstatic.com/firebasejs') ||
    req.url.includes('api.qrserver.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        }
        return networkRes;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
