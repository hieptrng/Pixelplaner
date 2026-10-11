/* Service Worker: macht den Planer offline nutzbar und installierbar (nur über https oder localhost, nicht per file://).
   index.html: erst Netz (damit Updates ankommen), sonst Zwischenspeicher. Bilder: sofort aus dem Zwischenspeicher, im Hintergrund aktualisiert. */
const CACHE = "pixel-planer-v1";
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "sprites/boss_bone_attack.png",
  "sprites/boss_bone_walk.png",
  "sprites/boss_demon_attack.png",
  "sprites/boss_demon_walk.png",
  "sprites/boss_golem_attack.png",
  "sprites/boss_golem_walk.png",
  "sprites/boss_shadow_attack.png",
  "sprites/boss_shadow_walk.png",
  "sprites/fighter.png",
  "sprites/fighter_attack.png",
  "sprites/fighter_walk.png",
  "sprites/healer.png",
  "sprites/healer_attack.png",
  "sprites/healer_walk.png",
  "sprites/mage.png",
  "sprites/mage_attack.png",
  "sprites/mage_walk.png",
  "sprites/orc_attack.png",
  "sprites/orc_walk.png",
  "sprites/pet_bear_attack.png",
  "sprites/pet_bear_walk.png",
  "sprites/pet_dragon_attack.png",
  "sprites/pet_dragon_fly.png",
  "sprites/pet_dragon_walk.png",
  "sprites/pet_owl_attack.png",
  "sprites/pet_owl_walk.png",
  "sprites/pet_phoenix_attack.png",
  "sprites/pet_phoenix_walk.png",
  "sprites/pet_turtle_attack.png",
  "sprites/pet_turtle_walk.png",
  "sprites/pet_wolf_attack.png",
  "sprites/pet_wolf_walk.png",
  "sprites/rat_attack.png",
  "sprites/rat_walk.png",
  "sprites/skeleton_attack.png",
  "sprites/skeleton_walk.png",
  "sprites/tank.png",
  "sprites/tank_attack.png",
  "sprites/tank_walk.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;   // Wetterdaten (Open-Meteo) gehen direkt ins Netz
  if (req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith("index.html")) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put("index.html", copy)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => {
    const net = fetch(req).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
