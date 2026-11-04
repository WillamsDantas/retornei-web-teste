// Guarda os arquivos do app para abrir sem internet. A versão muda a cada publicação.
const VERSAO = 'retornei-teste-202611042159';
const ARQUIVOS = ["./ajuda-conteudo.js","./app.js","./dados.js","./fonts/inter-latin-ext-wght-normal.woff2","./fonts/inter-latin-wght-normal.woff2","./icon.png","./icones/apple-180.png","./icones/icone-192.png","./icones/icone-512.png","./icones/maskable-512.png","./index.html","./manifest.webmanifest","./morphdom.min.js","./rules.js","./styles.css","./sync.js","./web.css","./web.js","./"];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  // página: tenta a versão nova primeiro; sem internet, usa a guardada
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
