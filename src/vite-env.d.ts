/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL for the backend API.
   * - In local dev: leave empty — Vite proxies /api and /health to localhost:8000.
   * - In production builds: set to the deployed backend URL, e.g. https://vpsai.onrender.com
   */
  readonly VITE_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
