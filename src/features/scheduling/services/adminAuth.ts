/**
 * Acesso ao painel da oficina (RF-022 Autenticar Administrador).
 *
 * PROTÓTIPO ACADÊMICO: a senha é conferida no próprio navegador, pelo
 * resumo SHA-256, e a sessão vale até fechar a aba. Isso demonstra o fluxo
 * (tela de acesso, erro, sair), mas NÃO protege dados de verdade: quem
 * abre o código vê o resumo e pode ler o localStorage. Em produção, o
 * acesso precisa ser feito no servidor (por exemplo, Supabase Auth com
 * senha em hash e regras de acesso no banco, como pede o RNF-04).
 *
 * Senha de demonstração: veja o README.
 */

/** SHA-256 da senha de demonstração. */
const PASSWORD_SHA256 = "08a0f642e26350fab0a5830d38fca438e2f721f211e75912a9811efd24ba5c57";
const SESSION_KEY = "nsc:painel:sessao";

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export type SignInResult = { ok: true } | { ok: false; message: string };

export async function signIn(password: string): Promise<SignInResult> {
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
}

export function isSignedIn(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function signOut() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nada a fazer.
  }
}
