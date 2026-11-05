import { useSyncExternalStore } from "react";
import { routes, type RouteName } from "./routes";

/**
 * Navegação por "hash" (a parte do endereço depois do #), sem biblioteca.
 *
 * Por que hash? O site é estático e pode ser publicado em qualquer
 * hospedagem, até numa subpasta, sem configurar o servidor. Endereços
 * como "#/agendar?servico=drift" funcionam em qualquer lugar e podem ser
 * favoritados ou compartilhados.
 *
 *   "#/agendar?servico=drift"  → tela "agendar", parâmetro servico=drift
 *   "#servicos" ou ""          → página inicial (âncora "servicos")
 */

export type Route = {
  name: RouteName;
  params: URLSearchParams;
  /** Âncora dentro da página inicial ("servicos"), se houver. */
  anchor: string | null;
  /** Identifica a tela e os parâmetros: muda quando a tela precisa recomeçar. */
  key: string;
};

const ROUTE_BY_PATH = new Map<string, RouteName>(
  (Object.keys(routes) as RouteName[]).map((name) => [routes[name].path, name]),
);

/** Lê um endereço (hash) e diz qual tela mostrar. */
export function parseHash(hash: string): Route {
  if (!hash.startsWith("#/")) {
    const anchor = hash.slice(1);
    return { name: "inicio", params: new URLSearchParams(), anchor: anchor || null, key: "inicio" };
  }

  const [path = "", query = ""] = hash.slice(2).split("?");
  const name = ROUTE_BY_PATH.get(path.replace(/\/$/, "")) ?? "inicio";
  return { name, params: new URLSearchParams(query), anchor: null, key: `${name}?${query}` };
}

/** Monta o endereço de uma tela, com parâmetros opcionais. */
export function href(name: RouteName, params?: Record<string, string>): string {
  if (name === "inicio") return "#inicio";
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return `#/${routes[name].path}${query}`;
}

/** Vai para uma tela pelo código (depois de enviar um formulário, por exemplo). */
export function navigate(name: RouteName, params?: Record<string, string>) {
  window.location.hash = href(name, params);
}

/* A tela atual fica guardada aqui e é recalculada a cada mudança de hash. */
let current = parseHash(window.location.hash);
const listeners = new Set<() => void>();

window.addEventListener("hashchange", () => {
  current = parseHash(window.location.hash);
  listeners.forEach((listener) => listener());
});

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Tela atual. O componente que usa este hook redesenha quando o endereço muda. */
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => current);
}
