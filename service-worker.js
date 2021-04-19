let cacheName='v0.2';

let cacheFiles = [
  './index.html',
  './popup2.css',
  './workPage.css',
  './tablesManager.js',
  './interfaces.js',
  './key1.png',
	'./app.js',
  './manifest.json',
  './indexDB.js',
];

const timeout = 300; // время ожидания ответа от сервера

const debug = false;

self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(cacheName).then((cache) => {
        if (debug) console.log('Caching assets.');
        cache.addAll(cacheFiles);
      })
    );
  });

self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(
          keys.filter(key => key !== cacheName)
          .map(key => caches.delete(key))
        );
      })
    );
  });

// при событии fetch, мы и делаем запрос, но используем кэш, только после истечения timeout.
self.addEventListener('fetch', (event) => {
    event.respondWith(TryGetFromNetwork(event.request, timeout)
    .then(
        resolve =>
        {
          if (debug) console.log('Get network answering.');
          UpdateCacheFile(event.request,resolve.clone());
          return (resolve);
        },
        reject =>
        {
          if (debug) console.log(`Load from chache.`);
          return GetFromCache(event.request);
        }
      )
    );
  });
  
// Временно-ограниченный запрос.
function TryGetFromNetwork(request, timeout) {
    return new Promise((resolve, reject) => {
        let timeoutId = setTimeout(reject, timeout);
        fetch(request).then((response) => {
            clearTimeout(timeoutId);
            resolve(response);
        }, reject);
    });
}

function GetFromCache(request) 
{
    return caches.open(cacheName).then((cache) =>
        cache.match(request)
        );
}

function UpdateCacheFile(request,response)
{
  caches.open(cacheName).then( cache =>
    {
      cache.match(request).then( (matching) =>
        {
          if (debug) console.log('Update file in cache!');
          return cache.put(request.url,response);
        }
      )
    }
  )
};