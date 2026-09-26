/* ═══════════════════════════════════════════
   EBC Service Worker
   Shell di-cache supaya app tetap bisa dibuka
   saat wifi sekolah tidak stabil. Data ujian
   sendiri TIDAK di-cache — selalu dari
   Convex supaya tidak ada soal basi.
   ═══════════════════════════════════════════ */

const CACHE = "ymh-ebc-v1";
const SHELL = ["/exam-client", "/", "/manifest.webmanifest", "/logo.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Individu supaya satu 404 tidak menggagalkan seluruh install
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Jangan pernah menyentuh trafik Convex / API lain — data harus selalu segar
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navigasi: coba jaringan dulu, jatuh ke cache kalau offline
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/exam-client", copy));
          return res;
        })
        .catch(() => caches.match("/exam-client").then((r) => r || caches.match("/"))),
    );
    return;
  }

  // Aset: sajikan dari cache lalu perbarui di belakang
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
