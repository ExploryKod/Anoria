const CACHE_NAME = 'offline-game-cache-v1';
const ASSETS = [
    './',
    '.src/index.html',
    '.src/styles/btn.css',
    '.src/styles/tooltip.css',
    '.src/styles/main.css',
    '.src/game.js',
    './public/resources/textures/',
    './public/resources/textures/grounds/ground_cobblestone5.png',
    './public/resources/textures/grounds/grass_rough2.png',
    './public/resources/lowpoly/village_town_assets_v2.glb',
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Fetch assets from cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Activate Service Worker and clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
