const CACHE = "mba-shell-v4"
const PAGES = ["/", "/player", "/dealer", "/download"]

async function remember(cache, request, response) {
  if (!response || !response.ok) return
  await cache.put(request, response.clone())
}

function withTimeout(url) {
  return fetch(url, { cache: "reload", signal: AbortSignal.timeout(8000) })
}

async function cachePage(cache, path) {
  const response = await withTimeout(path)
  await remember(cache, path, response)
  const html = await response.clone().text()
  const found = new Set()
  const pattern = /(?:src|href)="([^"]+)"/g
  for (const match of html.matchAll(pattern)) {
    const url = match[1]
    if (url.startsWith("/_next/") || url.startsWith("/icon") || url.startsWith("/apple-touch")) {
      found.add(url)
    }
  }
  await Promise.all(
    [...found].map(async (url) => {
      const asset = await withTimeout(url)
      await remember(cache, url, asset)
    }),
  )
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await Promise.all(
        PAGES.map(async (path) => {
          try {
            await cachePage(cache, path)
          } catch {
            // A missing page should not block the rest of the install.
          }
        }),
      )
      await Promise.all(
        ["/icon-192.png", "/icon-512.png", "/apple-touch-icon.png", "/manifest.webmanifest", "/MBA_download.pdf"].map(
          async (url) => {
            try {
              const response = await withTimeout(url)
              await remember(cache, url, response)
            } catch {
              // Icons are optional for the cached shell.
            }
          },
        ),
      )
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.includes("webpack-hmr") || url.pathname.includes("__next")) return

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE)
          await remember(cache, request, response)
        }
        return response
      } catch {
        const cached = await caches.match(request)
        if (cached) return cached
        if (request.mode === "navigate") {
          const page = await caches.match(url.pathname)
          if (page) return page
        }
        return new Response("MBA is saved on this device, but this page has not been stored yet.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      }
    })(),
  )
})
