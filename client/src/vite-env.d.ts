/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Override Quotable base URL (production). Default: https://api.quotable.io */
  readonly VITE_QUOTABLE_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}
