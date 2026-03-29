import { useEffect, useState } from "react";
import { getSettings, putSettings } from "../api";

export function SettingsPage() {
  const [theme, setTheme] = useState<"rose" | "dusk">("rose");
  const [notifications, setNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { settings } = await getSettings();
        if (cancelled) return;
        const t = settings.theme === "dusk" ? "dusk" : "rose";
        setTheme(t);
        setNotifications(!!settings.notifications_enabled);
        document.documentElement.dataset.theme = t;
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyTheme = async (t: "rose" | "dusk") => {
    setTheme(t);
    document.documentElement.dataset.theme = t;
    window.dispatchEvent(new CustomEvent("love-notes-theme", { detail: t }));
    setSaving(true);
    setError(null);
    try {
      await putSettings({ theme: t });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save theme.");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotifications = async () => {
    const next = !notifications;
    if (next) {
      if (typeof Notification === "undefined") {
        setHint("Notifications aren’t supported in this browser.");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setHint("Permission was not granted — daily reminders won’t show.");
        return;
      }
      setHint(
        "You’ll get a gentle reminder on days you open the app (PWA). True daily push while the app is closed needs extra server setup — see README."
      );
    } else {
      setHint(null);
    }
    setNotifications(next);
    setSaving(true);
    setError(null);
    try {
      await putSettings({ notifications_enabled: next });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setNotifications(!next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="app-shell">
      <h1 className="page-title">Settings</h1>
      <p className="page-sub">Make it feel like yours.</p>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
        </div>
      ) : null}
      {hint ? (
        <p className="install-hint" style={{ marginBottom: "1rem" }}>
          {hint}
        </p>
      ) : null}

      {loading ? (
        <p className="empty-hint">Loading…</p>
      ) : (
        <>
          <div className="setting-block">
            <div className="setting-label">Theme</div>
            <p className="setting-hint">Soft rose or quiet dusk.</p>
            <div className="theme-pills">
              <button
                type="button"
                className={theme === "rose" ? "selected" : ""}
                onClick={() => void applyTheme("rose")}
                disabled={saving}
              >
                Rose
              </button>
              <button
                type="button"
                className={theme === "dusk" ? "selected" : ""}
                onClick={() => void applyTheme("dusk")}
                disabled={saving}
              >
                Dusk
              </button>
            </div>
          </div>

          <div className="setting-block">
            <div className="setting-row">
              <div>
                <div className="setting-label">Daily reminder</div>
                <p className="setting-hint">A small nudge when you open the app on a new day.</p>
              </div>
              <button
                type="button"
                className={`toggle ${notifications ? "on" : ""}`}
                onClick={() => void toggleNotifications()}
                disabled={saving}
                aria-pressed={notifications}
                aria-label="Toggle daily reminder"
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
