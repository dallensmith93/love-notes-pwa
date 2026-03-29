import { fetchLoveQuoteFromApis } from "./lib/quoteProviders";
import { normalizeForHash, sha256Hex } from "./lib/textHash";
import type { LoveNote, UserSettings } from "./types";

export type { LoveNote, UserSettings };

const FAV_KEY = "love_notes_favorites_v1";
const SEEN_KEY = "love_notes_seen_hashes_v1";
const SETTINGS_KEY = "love_notes_settings_v1";
const HISTORY_KEY = "love_notes_history_v1";
const MAX_SEEN = 400;
const MAX_HISTORY = 40;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    /* ignore */
  }
  return fallback;
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

function readSeen(): string[] {
  return readJson<string[]>(SEEN_KEY, []);
}

function rememberHash(hash: string) {
  const list = readSeen();
  if (list.includes(hash)) return;
  list.unshift(hash);
  writeJson(SEEN_KEY, list.slice(0, MAX_SEEN));
}

function readFavorites(): LoveNote[] {
  return readJson<LoveNote[]>(FAV_KEY, []);
}

function writeFavorites(items: LoveNote[]) {
  writeJson(FAV_KEY, items);
}

function pushHistory(note: LoveNote) {
  const cur = readJson<LoveNote[]>(HISTORY_KEY, []);
  const next = [{ ...note }, ...cur.filter((n) => n.id !== note.id)].slice(0, MAX_HISTORY);
  writeJson(HISTORY_KEY, next);
}

export async function generateLoveNote(): Promise<{ note: LoveNote }> {
  const seen = new Set(readSeen());
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const raw = await fetchLoveQuoteFromApis();
    const hash = await sha256Hex(normalizeForHash(raw.content));
    if (seen.has(hash)) continue;
    seen.add(hash);
    rememberHash(hash);
    pushHistory(raw);
    return { note: raw };
  }

  throw new Error("Couldn’t find a new quote just now. Try again in a moment.");
}

export function getHistory(limit = 20, _cursor?: string) {
  const all = readJson<LoveNote[]>(HISTORY_KEY, []);
  const items = all.slice(0, limit);
  return Promise.resolve({ items, nextCursor: null as string | null });
}

export function addFavorite(note: LoveNote) {
  const favs = readFavorites();
  if (favs.some((n) => n.id === note.id)) {
    return Promise.resolve({ favorite: { note_id: note.id, already: true } });
  }
  writeFavorites([{ ...note }, ...favs.filter((n) => n.id !== note.id)]);
  return Promise.resolve({ favorite: { note_id: note.id } });
}

export function removeFavorite(noteId: string) {
  writeFavorites(readFavorites().filter((n) => n.id !== noteId));
  return Promise.resolve({ ok: true });
}

export function getFavorites() {
  return Promise.resolve({ items: readFavorites() });
}

function defaultSettings(): UserSettings {
  return { theme: "rose", notifications_enabled: false };
}

export function getSettings() {
  const s = readJson<Partial<UserSettings>>(SETTINGS_KEY, {});
  const settings: UserSettings = {
    theme: s.theme === "dusk" ? "dusk" : "rose",
    notifications_enabled: !!s.notifications_enabled,
  };
  return Promise.resolve({ settings });
}

export function putSettings(partial: { theme?: string; notifications_enabled?: boolean }) {
  const cur = readJson<UserSettings>(SETTINGS_KEY, defaultSettings());
  const next: UserSettings = {
    theme:
      partial.theme === "dusk" ? "dusk" : partial.theme === "rose" ? "rose" : cur.theme,
    notifications_enabled:
      typeof partial.notifications_enabled === "boolean"
        ? partial.notifications_enabled
        : cur.notifications_enabled,
  };
  writeJson(SETTINGS_KEY, next);
  return Promise.resolve({ settings: next });
}
