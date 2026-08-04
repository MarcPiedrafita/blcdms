const CACHE = "la-obra-v2";

// Las tipografías ya no vienen de Google: se guardan en la instalación para
// que la primera apertura sin cobertura salga con las letras bien.
const PRECARGA = [
  "/fonts/bricolage-grotesque.woff2",
  "/fonts/instrument-sans.woff2",
  "/fonts/plex-mono-400.woff2",
  "/fonts/plex-mono-600.woff2",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => Promise.allSettled(PRECARGA.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  // Navegación: red primero, cache si no hay internet.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Recursos propios: cache primero. Vite pone hash en los nombres, así que
  // un despliegue nuevo trae URLs nuevas y no se queda servido lo viejo.
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
