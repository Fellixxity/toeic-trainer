const CACHE_NAME = 'toeic-trainer-v3';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './config.js',
  './passages.js',
  './questions.js',
  './srs.js',
  './auth.js',
  './analytics.js',
  './effects.js',
  './gemini.js',
  './app.js',
  './manifest.json',
  './toeic_icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  // APIリクエスト(Supabase, Gemini)はキャッシュせずネットワーク優先
  if (e.request.url.includes('supabase.co') || e.request.url.includes('googleapis.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
