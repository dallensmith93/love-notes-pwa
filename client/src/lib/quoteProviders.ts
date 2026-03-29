/**
 * Love / romantic quotes only — Quotable (tagged) + bundled pool. No generic “inspiration” APIs.
 */

import lovePool from "../data/loveQuotes.json";
import type { LoveNote } from "../types";
import { normalizeForHash, sha256Hex } from "./textHash";

type QuotableRandom = {
  _id: string;
  content: string;
  author: string;
};

/**
 * Same-origin `/api/quotable` so the browser never hits cross-origin CORS:
 * - `vite dev` / `vite preview`: proxy in vite.config
 * - Netlify: rewrite in netlify.toml → https://api.quotable.io
 */
function quotableUrl(pathAndQuery: string): string {
  const q = pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`;
  const custom = import.meta.env.VITE_QUOTABLE_BASE?.replace(/\/$/, "");
  if (custom) return `${custom}${q}`;
  return `/api/quotable${q}`;
}

async function toNote(data: QuotableRandom): Promise<LoveNote> {
  const id = data._id || (await sha256Hex(normalizeForHash(data.content)));
  return {
    id,
    content: data.content.trim(),
    created_at: new Date().toISOString(),
  };
}

function pickOne<T>(items: T[]): T | null {
  if (!items.length) return null;
  return items[Math.floor(Math.random() * items.length)]!;
}

/** Batch random quotes — love / romantic tags only. */
async function fetchQuotableLoveBatch(tags: string, limit = 14): Promise<LoveNote[]> {
  const url = quotableUrl(`/quotes/random?limit=${limit}&maxLength=320&${tags}`);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  const out: LoveNote[] = [];
  for (const row of data) {
    if (row && typeof row === "object" && "content" in row) {
      out.push(await toNote(row as QuotableRandom));
    }
  }
  return out;
}

async function fetchQuotableSingle(tags: string): Promise<LoveNote | null> {
  const url = quotableUrl(`/random?maxLength=320&${tags}`);
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const row = (await res.json()) as QuotableRandom;
  if (!row?.content) return null;
  return toNote(row);
}

type PoolRow = { content: string };

export async function pickBundledLoveQuote(): Promise<LoveNote> {
  const rows = lovePool as PoolRow[];
  const row = pickOne(rows);
  if (!row?.content) {
    throw new Error("Bundled love quotes missing.");
  }
  const content = row.content.trim();
  const id = await sha256Hex(normalizeForHash(content));
  return {
    id,
    content,
    created_at: new Date().toISOString(),
  };
}

/**
 * Fetch a love/romantic quote from Quotable; fall back to bundled love-only list (offline / rate limits).
 */
export async function fetchLoveQuoteFromApis(): Promise<LoveNote> {
  const attempts: (() => Promise<LoveNote | null>)[] = [
    async () => pickOne(await fetchQuotableLoveBatch("tags=love")),
    async () => pickOne(await fetchQuotableLoveBatch("tags=romantic")),
    async () => pickOne(await fetchQuotableLoveBatch("tags=love|romantic")),
    async () => fetchQuotableSingle("tags=love"),
    async () => fetchQuotableSingle("tags=romantic"),
    async () => fetchQuotableSingle("tags=love|romantic"),
  ];

  for (const fn of attempts) {
    try {
      const n = await fn();
      if (n?.content) return n;
    } catch {
      /* next */
    }
  }

  return pickBundledLoveQuote();
}
