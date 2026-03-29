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

The repo includes **`netlify.toml`**. Connect the Git repo and use defaults — **do not** set the Netlify “Base directory” to `client` (leave it empty so the build runs from the **repository root**).

- **Publish directory:** `client/dist` (set automatically by `netlify.toml`)
- **Build command:** `npm install && npm run build` (also from `netlify.toml`)

`NPM_CONFIG_PRODUCTION=false` is set so **devDependencies** (Vite, TypeScript, PWA plugin) are installed on Netlify. SPA routes (`/favorites`, `/settings`) are rewritten to `index.html`.

## Customize

- Add or edit quotes in `client/src/data/loveQuotes.json`.
- Optional env at build time: `VITE_QUOTABLE_BASE` (Quotable-compatible base URL, no trailing slash).

## PWA icons

`powershell -ExecutionPolicy Bypass -File scripts/generate-pwa-icons.ps1`
