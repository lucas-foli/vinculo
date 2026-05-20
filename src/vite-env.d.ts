/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UNIFIED_INCOME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
