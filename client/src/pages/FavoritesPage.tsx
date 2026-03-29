import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LoveNote } from "../api";
import { getFavorites, removeFavorite } from "../api";

export function FavoritesPage() {
  const [items, setItems] = useState<LoveNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { items: list } = await getFavorites();
      setItems(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load favorites.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setError("Copy not supported.");
    }
  };

  const share = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Love note", text, url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(text);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("Share unavailable.");
    }
  };

  const unfav = async (id: string) => {
    try {
      await removeFavorite(id);
      setItems((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove.");
    }
  };

  return (
    <main className="app-shell">
      <h1 className="page-title">Favorites</h1>
      <p className="page-sub">Notes you’ve saved.</p>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="empty-hint">Loading…</p>
      ) : items.length === 0 ? (
        <p className="empty-hint">No favorites yet. Heart a note from the home screen.</p>
      ) : (
        <motion.ul
          className="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {items.map((n, i) => (
            <motion.li
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              {n.content}
              <div className="row-actions" style={{ marginTop: "0.65rem" }}>
                <button type="button" className="chip-btn" onClick={() => void copy(n.content)}>
                  Copy
                </button>
                <button type="button" className="chip-btn" onClick={() => void share(n.content)}>
                  Share
                </button>
                <button type="button" className="chip-btn" onClick={() => void unfav(n.id)}>
                  Remove
                </button>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </main>
  );
}
