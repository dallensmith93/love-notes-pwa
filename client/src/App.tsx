import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { getSettings } from "./api";

export default function App() {
  const loc = useLocation();
  const [theme, setTheme] = useState<"rose" | "dusk">("rose");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { settings } = await getSettings();
        if (cancelled) return;
        const t = settings.theme === "dusk" ? "dusk" : "rose";
        setTheme(t);
        document.documentElement.dataset.theme = t;
      } catch {
        document.documentElement.dataset.theme = "rose";
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onTheme = (e: Event) => {
      const t = (e as CustomEvent<"rose" | "dusk">).detail;
      if (t === "rose" || t === "dusk") {
        setTheme(t);
        document.documentElement.dataset.theme = t;
      }
    };
    window.addEventListener("love-notes-theme", onTheme as EventListener);
    return () => window.removeEventListener("love-notes-theme", onTheme as EventListener);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useDailyLoveHint();

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <nav className="nav" aria-label="Main">
        <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")} end>
          Home
        </NavLink>
        <NavLink to="/favorites" className={({ isActive }) => (isActive ? "active" : "")}>
          Favorites
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
          Settings
        </NavLink>
      </nav>
      <span className="sr-only" aria-live="polite">
        {loc.pathname}
      </span>
    </>
  );
}

/** First open of a new local day: gentle reminder if notifications are enabled and permitted. */
function useDailyLoveHint() {
  useEffect(() => {
    const KEY_DATE = "love_notes_last_daily_hint";
    const run = async () => {
      try {
        const { settings } = await getSettings();
        if (!settings.notifications_enabled) return;
        if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
        const today = new Date().toDateString();
        if (localStorage.getItem(KEY_DATE) === today) return;
        localStorage.setItem(KEY_DATE, today);
        new Notification("Love Notes", {
          body: "Tap in when you’re ready — a new note is one tap away.",
          icon: "/pwa-192x192.png",
        });
      } catch {
        /* ignore */
      }
    };
    const onVis = () => {
      if (document.visibilityState === "visible") void run();
    };
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
}
