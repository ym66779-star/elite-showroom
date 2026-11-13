const CACHE_NAME = 'elite-showroom-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// 1. تثبيت التحديث الجديد فوراً بدون انتظار إغلاق المتصفح
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 2. مسح جميع نسخ الكاش القديمة تلقائياً وتفعيل النسخة v6 على كل الأجهزة
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

  // استبعاد طلبات Firebase والـ API الخارجية من الكاش تماماً لضمان المزامنة اللحظية
  if (
    req.method !== 'GET' ||
    req.url.includes('firestore.googleapis.com') ||
    req.url.includes('firebasestorage.googleapis.com') ||
    req.url.includes('gstatic.com/firebasejs')
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        const resClone = networkRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return networkRes;
      })
      .catch(() => caches.match(req))
  );
});
