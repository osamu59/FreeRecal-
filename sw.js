const CACHE = 'recall-v2';
const FILES = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png',
  './benar.mp3', './salah.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

// Hapus cache versi lama (recall-v1 dan seterusnya)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Video dan permintaan rentang (Range, dipakai saat audio dicari) langsung dari jaringan
  if (url.pathname.endsWith('.mp4') || req.headers.has('range')) return;
  // Lagu dan sampul bawaan disimpan di penyimpanan aplikasi, jadi tidak perlu di-cache di sini
  if (url.pathname.includes('bawaan-slot')) return;

  // Halaman utama: ambil dari jaringan dulu supaya pembaruan langsung terbaca
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Aset lain: cache dulu, lalu jaringan
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    }))
  );
});
