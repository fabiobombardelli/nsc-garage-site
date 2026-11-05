import { createLocalStorageRepository } from "./data/localStorageRepository";
import type { createSupabaseBackend } from "./data/supabase";
import { localAdminAuth, type AdminAuth } from "./services/adminAuth";
import type { SchedulingService } from "./services/contract";
import { createSchedulingService } from "./services/schedulingService";

/**
 * Ponto único de montagem do agendamento.
 *
 * Com as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no build
 * (arquivo .env, ver PUBLICAR.md), o site usa o banco da oficina no
 * Supabase. Sem elas, usa a demonstração no navegador (localStorage), como
 * na apresentação da faculdade. As telas não mudam: falam só com o
 * contrato SchedulingService.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const backendMode: SchedulingService["mode"] =
  SUPABASE_URL && SUPABASE_ANON_KEY ? "supabase" : "local";

type Backend = ReturnType<typeof createSupabaseBackend>;

/** O módulo do Supabase só é baixado no modo online (a demonstração fica mais leve). */
let remote: Promise<Backend> | null = null;
const loadRemote = () =>
  (remote ??= import("./data/supabase").then((module) =>
    module.createSupabaseBackend(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? ""),
  ));

/** Repassa cada chamada ao serviço remoto quando ele terminar de carregar. */
function remoteService(): SchedulingService {
  const ready = async () => (await loadRemote()).service;
  return {
    mode: "supabase",
    getWeek: async (weekStart) => (await ready()).getWeek(weekStart),
    getDay: async (date) => (await ready()).getDay(date),
    book: async (input) => (await ready()).book(input),
    lookup: async (phone, protocol) => (await ready()).lookup(phone, protocol),
    cancelByCustomer: async (protocol, phone) => (await ready()).cancelByCustomer(protocol, phone),
    rate: async (protocol, phone, score, comment) =>
      (await ready()).rate(protocol, phone, score, comment),
    listAll: async () => (await ready()).listAll(),
    changeStatus: async (protocol, to) => (await ready()).changeStatus(protocol, to),
    subscribe(listener) {
      let unsubscribe: (() => void) | null = null;
      let active = true;
      void ready().then((service) => {
        if (active) unsubscribe = service.subscribe(listener);
      });
      return () => {
        active = false;
        unsubscribe?.();
      };
    },
  };
}

function remoteAuth(): AdminAuth {
  const ready = async () => (await loadRemote()).auth;
  return {
    usesEmail: true,
    signIn: async (credentials) => (await ready()).signIn(credentials),
    isSignedIn: async () => (await ready()).isSignedIn(),
    signOut: async () => (await ready()).signOut(),
  };
}

export const schedulingService: SchedulingService =
  backendMode === "supabase"
    ? remoteService()
    : createSchedulingService(createLocalStorageRepository());

export const adminAuth: AdminAuth = backendMode === "supabase" ? remoteAuth() : localAdminAuth;
