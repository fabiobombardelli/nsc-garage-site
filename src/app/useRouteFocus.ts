import { useEffect, useRef } from "react";
import type { Route } from "./router";
import { routes, type RouteName } from "./routes";

/**
 * O que um site de várias telas precisa fazer a cada troca de tela para
 * quem usa teclado ou leitor de tela (WCAG 2.4.2, 2.4.3 e 4.1.3):
 *
 * 1. trocar o título da aba;
 * 2. levar o foco ao título (h1) da nova tela, para o leitor anunciar
 *    onde a pessoa chegou, e voltar a rolagem ao topo;
 * 3. numa âncora da página inicial ("#servicos"), rolar até ela.
 *
 * Também cuida das âncoras da própria tela (como o atalho "Ir para o
 * conteúdo"): fora da página inicial, elas não podem trocar o endereço,
 * senão a tela atual se perderia.
 */
export function useRouteFocus(route: Route) {
  /** A última tela tratada. Só é gravada depois que a rolagem e o foco aconteceram. */
  const last = useRef<{ name: RouteName; signature: string } | null>(null);

  useEffect(() => {
    document.title = routes[route.name].title;

    const signature = `${route.key}#${route.anchor ?? ""}`;
    const previous = last.current;
    if (previous?.signature === signature) return;
    const isFirst = previous === null;
    // Âncora dentro da própria página inicial: o navegador já rola sozinho.
    const stayedHome = previous?.name === "inicio" && route.name === "inicio";

    let observer: MutationObserver | null = null;
    let giveUp = 0;
    // Espera a nova tela ser desenhada antes de mover rolagem e foco.
    const frame = requestAnimationFrame(() => {
      last.current = { name: route.name, signature };
      if (stayedHome) return;

      if (route.anchor) {
        const target = document.getElementById(route.anchor);
        target?.scrollIntoView({ behavior: "instant", block: "start" });
        if (!isFirst && target?.hasAttribute("tabindex")) target.focus({ preventScroll: true });
        return;
      }
      if (isFirst) return;
      window.scrollTo({ top: 0, behavior: "instant" });
      // O título da tela; na página inicial, o conteúdo principal.
      const findTitle = () => document.querySelector<HTMLElement>("[data-page-title]");
      const title = findTitle();
      if (title || route.name === "inicio") {
        (title ?? document.getElementById("conteudo"))?.focus({ preventScroll: true });
        return;
      }
      // Tela interna ainda carregando (código sob demanda): o foco vai ao
      // conteúdo agora e ao título assim que ele aparecer.
      const main = document.getElementById("conteudo");
      main?.focus({ preventScroll: true });
      if (!main) return;
      observer = new MutationObserver(() => {
        const late = findTitle();
        if (!late) return;
        observer?.disconnect();
        window.clearTimeout(giveUp);
        // Só puxa o foco se a pessoa não saiu do lugar enquanto esperava.
        if (document.activeElement === main || document.activeElement === document.body)
          late.focus({ preventScroll: true });
      });
      observer.observe(main, { childList: true, subtree: true });
      giveUp = window.setTimeout(() => observer?.disconnect(), 15000);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.clearTimeout(giveUp);
    };
  }, [route.key, route.name, route.anchor]);

  useEffect(() => {
    if (route.name === "inicio") return;

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href") ?? "";
      if (!link || hash.startsWith("#/") || hash.length < 2) return;

      // Âncora que existe nesta tela: rola e foca sem trocar o endereço.
      const target = document.getElementById(hash.slice(1));
      if (!target) return; // Não existe aqui: o endereço muda e a página inicial abre.
      event.preventDefault();
      target.scrollIntoView({ block: "start" });
      if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [route.name]);
}
