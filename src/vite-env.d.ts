/// <reference types="vite/client" />

/** Variáveis do build (arquivo .env). Ver PUBLICAR.md. */
interface ImportMetaEnv {
  /** URL do projeto no Supabase, ex.: https://abcd1234.supabase.co */
  readonly VITE_SUPABASE_URL?: string;
  /** Chave pública (anon) do projeto. Pode ir no site: o acesso é limitado pelo banco. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
