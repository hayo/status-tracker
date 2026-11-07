/*
 * Service worker: bewaart de app-bestanden, zodat de app ook zonder internet start.
 * Verhoog VERSIE bij elke wijziging, samen met de versie in gegevens.js.
 * Anders blijft de browser de oude bestanden gebruiken.
 */

const VERSIE = '2.0';
const CACHE = `aanzien-${VERSIE}`;
const BESTANDEN = [
  './',
  './app.css',
  './app.js',
  './gegevens.js',
  './manifest.webmanifest',
  './iconen/kroon.svg',
  './iconen/icoon-180.png',
  './iconen/icoon-192.png',
  './iconen/icoon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((cache) => cache.addAll(BESTANDEN.map((url) => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((namen) => Promise.all(namen.filter((n) => n.startsWith('aanzien-') && n !== CACHE).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  const sleutel = request.mode === 'navigate' ? './' : request;
  event.respondWith(caches.match(sleutel, { ignoreSearch: true }).then((antwoord) => antwoord ?? fetch(request)));
});
