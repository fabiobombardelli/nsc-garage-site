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
 *   "#/?secao=servicos"        → página inicial, rolando até "servicos"
 *                                (usado nos links das telas internas)
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
  const params = new URLSearchParams(query);
  if (name === "inicio") return { name, params, anchor: params.get("secao"), key: "inicio" };
  return { name, params, anchor: null, key: `${name}?${query}` };
}

/** Monta o endereço de uma tela, com parâmetros opcionais. */
export function href(name: RouteName, params?: Record<string, string>): string {
  if (name === "inicio") return "#inicio";
  const query = params ? `?${new URLSearchParams(params)}` : "";
  return `#/${routes[name].path}${query}`;
}

/**
 * Link para uma seção da página inicial ("#servicos") que funciona em
 * qualquer tela. Na inicial, continua sendo a âncora (o navegador rola);
 * nas outras telas, a seção não existe, então o link abre a inicial nela.
 */
export function sectionHref(hash: `#${string}`, current: Route): string {
  if (hash.startsWith("#/") || current.name === "inicio") return hash;
  const id = hash.slice(1);
  return id === "inicio" ? "#/" : `#/?secao=${id}`;
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
