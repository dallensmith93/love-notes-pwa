import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import "./styles/global.css";

registerSW({ immediate: true });

const KEY = "love_notes_device_id";
if (typeof window !== "undefined" && !localStorage.getItem(KEY)) {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `d-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  localStorage.setItem(KEY, id);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
