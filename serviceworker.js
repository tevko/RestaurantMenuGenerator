// The files we want to cache
var CACHE_NAME = 'site-cache-v1';
var urlsToCache = [
  '/',
  '/build/css/main.css',
  '/build/js/main.js',
  '/build/js/worker.js'
];

// Set the callback for the install step
self.addEventListener('install', function(event) {
    // Perform install steps
	event.waitUntil(
		caches.open(CACHE_NAME)
		.then(function(cache) {
			return cache.addAll(urlsToCache);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request)
		.then(function(response) {
			// Cache hit - return response
			if (response) {
				return response;
			}

			return fetch(event.request);
		})
	);
});