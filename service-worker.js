// ** cache name **
const cacheName = 'tech-in-rio-assets-v1';


// ** utility static data **
const offlineResponse = new Response('You are offline', {
  status: 200,
  statusText: 'OK',
  headers: new Headers({
    'Content-Type': 'text/html',
  }),
});

const assetsExtensions = [
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.json',
  '.woff2',
  '.woff',
  '.ttf',
  '.otf',
  '.eot',
];

// ** utility basic functions **
const cacheRequest = async (request, response) => {
  const cache = await caches.open(cacheName);

  cache.put(request, response.clone());
};

const shouldCacheRequest = (request) => {
  if (request.method === 'GET') return true;

  if (assetsExtensions.some((ext) => request.url.endsWith(ext))) return true;

  return false;
};

const responseFromCache = async (url) => {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(url);

  if (!cachedResponse) {
    return;
  }

  return cachedResponse;
};

const responseFromNetwork = async (request) => {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    return;
  }
};

const networkOnly = async (event) => {
  event.respondWith(await responseFromNetwork(event.request));
};

const cacheFirstFallingBackToNetwork = async (event) => {
  event.respondWith(
    (async () => {
      const cachedResponse = await responseFromCache(event.request.url);

      if (cachedResponse) {
        return cachedResponse;
      }

      try {
        const networkResponse = await responseFromNetwork(event.request);

        await cacheRequest(event.request, networkResponse);

        return networkResponse;
      } catch (error) {
        return offlineResponse;
      }
    })()
  );
};

self.addEventListener('fetch', async (event) => {
  if (shouldCacheRequest(event.request)) {
    cacheFirstFallingBackToNetwork(event);
  } else {
    return networkOnly(event);
  }
});
