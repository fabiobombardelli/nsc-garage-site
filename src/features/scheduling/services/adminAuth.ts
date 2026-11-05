/**
 * Acesso ao painel da oficina (RF-022 Autenticar Administrador).
 *
 * Duas implementações com o mesmo contrato:
 * - "local" (demonstração): senha conferida no navegador pelo resumo
 *   SHA-256 e sessão até fechar a aba. Mostra o fluxo, mas NÃO protege dados.
 *   Senha de demonstração: veja o README.
 * - "supabase" (online): e-mail e senha do Supabase Auth, e o servidor
 *   confere se a pessoa está na tabela oficina_admins (data/supabase/).
 */
export type SignInResult = { ok: true } | { ok: false; message: string };

export interface AdminAuth {
  /** O acesso pede e-mail além da senha? */
  readonly usesEmail: boolean;
  signIn(credentials: { email?: string; password: string }): Promise<SignInResult>;
  isSignedIn(): Promise<boolean>;
  signOut(): Promise<void>;
}

/** SHA-256 da senha de demonstração. */
const PASSWORD_SHA256 = "08a0f642e26350fab0a5830d38fca438e2f721f211e75912a9811efd24ba5c57";
const SESSION_KEY = "nsc:painel:sessao";

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const localAdminAuth: AdminAuth = {
  usesEmail: false,

  async signIn({ password }) {
    if (!password) return { ok: false, message: "Digite a senha de acesso da oficina." };
    if (!globalThis.crypto?.subtle) {
      return {
        ok: false,
        message: "Este navegador bloqueou a verificação. Abra o site por HTTPS ou por localhost.",
      };
    }
    if ((await sha256(password)) !== PASSWORD_SHA256) {
      return { ok: false, message: "Senha incorreta. Confira e tente de novo." };
    }
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Sem sessionStorage, o acesso vale só enquanto a tela estiver aberta.
    }
    return { ok: true };
  },

  async isSignedIn() {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  },

  async signOut() {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Nada a fazer.
    }
  },
};
