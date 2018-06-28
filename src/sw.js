if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('./sw.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

var CACHE_NAME = 'restaurant-reviews-v1';
var urlsToCache = [
  '/',
  '/manifest.json',
  '/sw.js',
  '/index.html',
  '/assets/media/1.jpg',
  '/assets/media/1_400.jpg',
  '/assets/media/1_720.jpg',
  '/assets/media/2.jpg',
  '/assets/media/2_400.jpg',
  '/assets/media/2_720.jpg',
  '/assets/media/3.jpg',
  '/assets/media/3_400.jpg',
  '/assets/media/3_720.jpg',
  '/assets/media/4.jpg',
  '/assets/media/4_400.jpg',
  '/assets/media/4_720.jpg',
  '/assets/media/5.jpg',
  '/assets/media/5_400.jpg',
  '/assets/media/5_720.jpg',
  '/assets/media/6.jpg',
  '/assets/media/6_400.jpg',
  '/assets/media/6_720.jpg',
  '/assets/media/7.jpg',
  '/assets/media/7_400.jpg',
  '/assets/media/7_720.jpg',
  '/assets/media/8.jpg',
  '/assets/media/8_400.jpg',
  '/assets/media/8_720.jpg',
  '/assets/media/9.jpg',
  '/assets/media/9_400.jpg',
  '/assets/media/9_720.jpg',
  '/assets/media/10.jpg',
  '/assets/media/10_400.jpg',
  '/assets/media/10_720.jpg',
  '/assets/media/review.svg',
  '/assets/media/review.png',
  '/assets/js/main.bundle.js',
  '/assets/js/restaurant.bundle.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-icon.png',
  'https://unpkg.com/leaflet@1.3.1/dist/images/marker-shadow.png',
  'https://fonts.googleapis.com/css?family=Ubuntu:700|Ubuntu+Condensed',
  'https://fonts.gstatic.com/s/ubuntucondensed/v8/u-4k0rCzjgs5J7oXnJcM_0kACGMtT-Dfq9PrNX0.woff2',
  'https://fonts.gstatic.com/s/ubuntu/v11/4iCv6KVjbNBYlgoCxCvjsGyNPYZvgw.woff2',
  'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1205/1540.jpg70?access_token=pk.eyJ1IjoiZ29raGFuYXAiLCJhIjoiY2ppeHM4OWl2MDJzaDNrcXBqN25tZzNrZCJ9.cxPDTLgFdjaMdmj06H_DUg',
  'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1206/1539.jpg70?access_token=pk.eyJ1IjoiZ29raGFuYXAiLCJhIjoiY2ppeHM4OWl2MDJzaDNrcXBqN25tZzNrZCJ9.cxPDTLgFdjaMdmj06H_DUg',
  'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1206/1540.jpg70?access_token=pk.eyJ1IjoiZ29raGFuYXAiLCJhIjoiY2ppeHM4OWl2MDJzaDNrcXBqN25tZzNrZCJ9.cxPDTLgFdjaMdmj06H_DUg',
  'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1205/1539.jpg70?access_token=pk.eyJ1IjoiZ29raGFuYXAiLCJhIjoiY2ppeHM4OWl2MDJzaDNrcXBqN25tZzNrZCJ9.cxPDTLgFdjaMdmj06H_DUg',
  'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1207/1539.jpg70?access_token=pk.eyJ1IjoiZ29raGFuYXAiLCJhIjoiY2ppeHM4OWl2MDJzaDNrcXBqN25tZzNrZCJ9.cxPDTLgFdjaMdmj06H_DUg',
  'https://api.tiles.mapbox.com/v4/mapbox.streets/12/1207/1540.jpg70?access_token=pk.eyJ1IjoiZ29raGFuYXAiLCJhIjoiY2ppeHM4OWl2MDJzaDNrcXBqN25tZzNrZCJ9.cxPDTLgFdjaMdmj06H_DUg'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
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

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});