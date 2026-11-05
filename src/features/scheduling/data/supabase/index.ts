import { createClient } from "@supabase/supabase-js";
import type { AdminAuth } from "../../services/adminAuth";
import type { SchedulingService } from "../../services/contract";
import { createSupabaseSchedulingService } from "./supabaseSchedulingService";

/**
 * Monta o modo online: o cliente do Supabase, o serviço de agendamento e o
 * acesso da oficina. Este módulo só é carregado quando o site tem as
 * chaves do Supabase (ver features/scheduling/index.ts), então quem usa a
 * demonstração não baixa a biblioteca.
 */
export function createSupabaseBackend(
  url: string,
  anonKey: string,
): { service: SchedulingService; auth: AdminAuth } {
  const client = createClient(url, anonKey, {
    auth: { persistSession: true, storageKey: "nsc:painel:supabase" },
  });

  const isAdmin = async () => {
    const { data, error } = await client.rpc("e_oficina");
    return !error && data === true;
  };

  const auth: AdminAuth = {
    usesEmail: true,

    async signIn({ email = "", password }) {
      if (!email.trim() || !password) {
        return { ok: false, message: "Digite o e-mail e a senha de acesso da oficina." };
      }
      const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        return { ok: false, message: "E-mail ou senha incorretos. Confira e tente de novo." };
      }
      if (!(await isAdmin())) {
        await client.auth.signOut();
        return { ok: false, message: "Este usuário não tem acesso ao painel da oficina." };
      }
      return { ok: true };
    },

    async isSignedIn() {
      const { data } = await client.auth.getSession();
      return Boolean(data.session) && (await isAdmin());
    },

    async signOut() {
      await client.auth.signOut();
    },
  };

  return { service: createSupabaseSchedulingService(client), auth };
}
