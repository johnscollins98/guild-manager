/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_REINVITE_LINK: string;
  readonly VITE_BACKEND_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}