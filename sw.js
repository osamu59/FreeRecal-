const CACHE = 'recall-v1';
const FILES = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png',
  './benar.mp3', './salah.mp3'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Video diambil langsung dari jaringan agar pemutarannya lancar
  if (req.url.endsWith('.mp4')) return;
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
