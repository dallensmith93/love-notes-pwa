import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LoveNote } from "../api";
import { addFavorite, generateLoveNote, getFavorites, removeFavorite } from "../api";

export function HomePage() {
  const [note, setNote] = useState<LoveNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  const [installHint, setInstallHint] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { items } = await getFavorites();
        if (cancelled) return;
        setFavIds(new Set(items.map((i) => i.id)));
      } catch {
        /* offline or API down */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setInstallHint("Add to your home screen for the app experience.");
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { note: n } = await generateLoveNote();
      setNote(n);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const isFav = note ? favIds.has(note.id) : false;

  const toggleFavorite = async () => {
    if (!note) return;
    try {
      if (isFav) {
        await removeFavorite(note.id);
        setFavIds((prev) => {
          const next = new Set(prev);
          next.delete(note.id);
          return next;
        });
      } else {
        await addFavorite(note);
        setFavIds((prev) => new Set(prev).add(note.id));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update favorite.");
    }
  };

  const copyNote = async () => {
    if (!note) return;
    try {
      await navigator.clipboard.writeText(note.content);
    } catch {
      setError("Copy not supported in this browser.");
    }
  };

  const shareNote = async () => {
    if (!note) return;
    const payload = { text: note.content, title: "Love note" };
    try {
      if (navigator.share) {
        await navigator.share({ ...payload, url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(note.content);
        setError(null);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        setError("Share was cancelled or unavailable.");
      }
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
    setInstallHint(null);
  };

  return (
    <main className="app-shell">
      <h1 className="page-title">For you</h1>
      <p className="page-sub">One tap. Something new, just for her.</p>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}

      <div style={{ position: "relative", minHeight: 200 }}>
        <AnimatePresence mode="wait">
          {note ? (
            <motion.div
              key={note.id}
              className="note-card"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="note-text">{note.content}</p>
              <span className="deco-heart" aria-hidden>
                ♥
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              className="note-card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <p className="note-text" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                Tap the button below when you’re ready for your note.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ marginTop: "1.25rem" }}>
        <button type="button" className="primary-btn" onClick={() => void refresh()} disabled={loading}>
          {loading ? "Writing…" : "New love note"}
        </button>
      </div>

      {note ? (
        <div className="row-actions">
          <button
            type="button"
            className={`chip-btn ${isFav ? "fav-on" : ""}`}
            onClick={() => void toggleFavorite()}
            aria-pressed={isFav}
          >
            {isFav ? "Favorited" : "Favorite"}
          </button>
          <button type="button" className="chip-btn" onClick={() => void copyNote()}>
            Copy
          </button>
          <button type="button" className="chip-btn" onClick={() => void shareNote()}>
            Share
          </button>
        </div>
      ) : null}

      {installHint ? (
        <p className="install-hint">
          {installHint}{" "}
          {deferredPrompt ? (
            <button type="button" className="chip-btn" style={{ marginTop: 8 }} onClick={() => void installApp()}>
              Install
            </button>
          ) : (
            <span>Use your browser menu: Add to Home Screen.</span>
          )}
        </p>
      ) : null}
    </main>
  );
}
