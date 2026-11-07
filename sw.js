/*
 * Service worker: bewaart de app-bestanden, zodat de app ook zonder internet start.
 * Eerst het netwerk, dan de bewaarde kopie. Zo is er na een wijziging niets extra te doen.
 */

const CACHE = 'aanzien';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // no-cache: altijd even bij de server navragen, zodat er geen oude en nieuwe bestanden door elkaar komen.
      const antwoord = await fetch(request, { cache: 'no-cache' });
      if (antwoord.ok) await cache.put(request, antwoord.clone());
      return antwoord;
    } catch (fout) {
      return (await cache.match(request, { ignoreSearch: true })) ?? Promise.reject(fout);
    }
  })());
});
