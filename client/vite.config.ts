import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "pwa-192x192.png", "pwa-512x512.png"],
      manifest: {
        name: "Love Notes",
        short_name: "Love Notes",
        description: "A gentle note, every time you tap.",
        theme_color: "#2d1f24",
        background_color: "#1a1215",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api/],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api/quotable": {
        target: "https://api.quotable.io",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/quotable/, ""),
      },
    },
  },
});
