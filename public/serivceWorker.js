//Service Worker lifecycle: Installation => Waiting => Activation
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/styles.css",
    "/offlinedb.js",
    "/manifest.webmanifest",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
  ];
  
  const CACHE_NAME = "static-cache-v2";
  const DATA_CACHE_NAME = "data-cache-v1";
    
  //Install event listener for local caching
  self.addEventListener("install", function (event) {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        console.log("Your files were pre-cached successfully!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    self.skipWaiting();
  });
  
//Check and remove old cache data 
  self.addEventListener("activate", function (event) {
    event.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
            }
          })
        );
      })
    );
    self.clients.claim();
  });
  
//Service worker fetch function
  self.addEventListener("fetch", function (event) {
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches
          .open(DATA_CACHE_NAME)
          .then((cache) => {
            return fetch(event.request)
              .then((response) => {
                if (response.status === 200) {
                  cache.put(event.request.url, response.clone());
                }
                return response;
              })
              .catch((err) => {
                return cache.match(event.request);
              });
          })
          .catch((err) => console.log(err))
      );
  
      return;
    }
  
   //Offline caching funciton
    event.respondWith(
      caches.match(event.request).then(function (response) {
        return response || fetch(event.request);
      })
    );
  });