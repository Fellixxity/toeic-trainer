const CACHE_NAME = 'toeic-trainer-v4';
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
  // 新しい SW を待機させずに即座に有効化する
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      // 既に開いているタブも新しい SW の管理下に置く
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // APIリクエスト(Supabase, Gemini)はキャッシュせずネットワーク優先
  if (e.request.url.includes('supabase.co') || e.request.url.includes('googleapis.com')) {
    return;
  }
  if (e.request.method !== 'GET') return;

  // ネットワーク優先（オフライン時のみキャッシュにフォールバック）。
  // キャッシュ優先にすると、デプロイしても端末が古い HTML/JS を掴んだままになる。
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // 取得できたら次回のオフライン用に控えを更新する
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => {
        if (cached) return cached;
        // ページ遷移のリクエストならアプリ本体を返す
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      }))
  );
});
