# Love Notes PWA

Mobile-first PWA for **romantic love quotes** only. One tap → a new note. No database, no backend, no API keys.

## Sources

1. **[Quotable](https://github.com/lukePeavey/quotable)** — random quotes filtered to **`love`**, **`romantic`**, or **`love|romantic`** (batched and single requests).
2. **Bundled list** — `client/src/data/loveQuotes.json` (70+ love/romance lines) if the network fails or the API returns nothing.

Favorites and settings live in **localStorage**. Seen quotes are de-duplicated by a hash of the text.

## Run

```bash
npm install
npm run dev
```

Open **http://localhost:5173**. In dev, `/api/quotable` is proxied to avoid CORS issues.

## Build

```bash
npm run build
```

Output: `client/dist`. Serve over **HTTPS** for installable PWA behavior.

## Deploy on Netlify

The repo includes **`netlify.toml`**. It sets **`base = "client"`** so Netlify installs and builds **only the Vite app** (reliable on CI). You should **not** override “Base directory” in the Netlify UI, or set it to **`client`** to match.

- **Publish directory:** `dist` (relative to `client`, i.e. `client/dist`)
- **Build command:** `npm ci && npm run build` (inside `client`)

Vite, TypeScript, and the PWA plugin are normal **dependencies** so `npm ci` always installs them. SPA routes are rewritten to `index.html`.

## Customize

- Add or edit quotes in `client/src/data/loveQuotes.json`.
- Optional env at build time: `VITE_QUOTABLE_BASE` (Quotable-compatible base URL, no trailing slash).

## PWA icons

`powershell -ExecutionPolicy Bypass -File scripts/generate-pwa-icons.ps1`
