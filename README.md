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

Open **http://localhost:5173**. **`/api/quotable`** is proxied to Quotable (dev, preview, and **Netlify production**) so the app stays same-origin and avoids browser CORS blocks.

## Build

```bash
npm run build
```

Output: `client/dist`. Serve over **HTTPS** for installable PWA behavior.

## Deploy on Netlify

**`netlify.toml`** runs from the **repo root**:

- **Command:** `npm ci --prefix client && npm run build --prefix client` (always uses **`client/package-lock.json`**)
- **Publish:** `client/dist`

Clear any custom **Build command** / **Publish directory** / **Base directory** in the Netlify UI so the config file wins. Root **`package.json`** includes an **`overrides`** block so hoisted installs never pull the broken `brace-expansion@2.0.3` metadata.

## Customize

- Add or edit quotes in `client/src/data/loveQuotes.json`.
- Optional env at build time: `VITE_QUOTABLE_BASE` (Quotable-compatible base URL, no trailing slash).

## PWA icons

`powershell -ExecutionPolicy Bypass -File scripts/generate-pwa-icons.ps1`
