import { useSyncExternalStore } from "react";

/**
 * Indica se o movimento deve ser reduzido, seja por preferência do sistema
 * ou por escolha no site (atributo data-motion no <html>, ver
 * lib/accessibility.ts). Reage na hora se a preferência mudar.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, readReducedMotion, () => false);
}

function readReducedMotion(): boolean {
  return document.documentElement.dataset.motion === "reduce";
}

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });
  return () => observer.disconnect();
}
