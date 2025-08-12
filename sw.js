const CACHE_VERSION = "202508111927";
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  "/index.html",
  "/index.css",
  "/d3.v7.min.js",
  "/index.js",
  "/icon.png",
  "/icon.svg",
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting(); // activate immediately on first load
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;

  // 1) For navigations, serve the cached app shell (index.html)
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("/index.html", { ignoreSearch: true })
        .then(resp => resp || fetch(req))
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // 2) For GET requests to same-origin static assets, use cache-first
  if (req.method === "GET" && new URL(req.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(rsp => {
        // Optionally put fetched static files in cache
        const copy = rsp.clone();
        // Only cache successful, basic (same-origin) responses
        if (rsp.ok && (rsp.type === "basic" || rsp.type === "opaque")) {
          caches.open(STATIC_CACHE).then(cache => cache.put(req, copy));
        }
        return rsp;
      }))
    );
  }
});
