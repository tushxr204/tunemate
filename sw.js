// Tunemate service worker: makes the app installable and lets it open without internet.
// - The app shell (page, script, icons) is cached and updated in the background.
// - API calls, Supabase, song previews and YouTube always go to the network (never cached here).
const VERSION = 'tunemate-v3';
const SHELL = ['/', '/index.html', '/app.js', '/manifest.webmanifest',
  '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png', '/icons/apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // Supabase, Apple, YouTube, fonts: straight to network
  if (url.pathname.startsWith('/api/')) return;             // always live data

  // Pages and the app script: network first (so updates arrive), cached copy when offline.
  if (req.mode === 'navigate' || url.pathname === '/app.js') {
    event.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(req.mode === 'navigate' ? '/index.html' : req, copy));
        return res;
      }).catch(() => caches.match(req.mode === 'navigate' ? '/index.html' : req))
    );
    return;
  }
  // Icons and other static files: cache first.
  event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  })));
});
