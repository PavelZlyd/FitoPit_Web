// FitoPit Service Worker — офлайн-кэш приложения
const CACHE_VERSION = 'fitopit-v6';

// Файлы ядра приложения (app shell), которые кэшируем при установке
const APP_SHELL = [
  './',
  './index.html',
  './main.js',
  './style.css',
  './data.js',
  './data/recipes.json',
  './userStore.js',
  './generator.js',
  './shoppingList.js',
  './ui.js',
  './images/dishes/plate.svg',
  './images/dishes/breakfast.svg',
  './images/dishes/soup.svg',
  './images/dishes/meat.svg',
  './images/dishes/fish.svg',
  './images/dishes/salad.svg',
  './images/dishes/porridge.svg',
  './images/dishes/treat.svg',
  './manifest.json',
  './favicon.png',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png'
];

// Установка: предзагружаем app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Активация: удаляем кэши старых версий
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Запросы: cache-first для своих ресурсов, сеть для остального
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Кэшируем только GET-запросы
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Сторонние запросы (шрифты, отправка фидбэка) — только сеть
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Кэшируем успешные ответы того же origin
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // Офлайн-фолбэк для навигации — отдаём index.html
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});
