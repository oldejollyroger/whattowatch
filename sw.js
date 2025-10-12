<<<<<<< HEAD
// sw.js
const CACHE_NAME = 'what-to-watch-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/config.js',
  '/app.jsx',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
=======
// sw.js
const CACHE_NAME = 'movie-picker-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/config.js',
  '/app.jsx',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
>>>>>>> ef75e2b61c11c1e5d6638b04c5c67435c583f2bc
});