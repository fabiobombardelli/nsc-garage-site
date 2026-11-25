/**
 * VLibras (governo federal): botão que traduz o texto da página para Libras
 * com um avatar. O script do vlibras.gov.br cria o próprio botão (num Shadow
 * DOM, à direita, no meio da tela) e só baixa o avatar quando alguém clica.
 * Ele é carregado depois que a página termina de abrir, para não pesar na
 * abertura. Domínios liberados na CSP de public/_headers.
 *
 * O script põe o botão e o avatar direto no <body>; aqui eles são movidos
 * para uma região com nome (<aside>), para todo conteúdo ficar dentro de um
 * landmark (WCAG 1.3.1, regra "region" do axe). Como são position: fixed,
 * nada muda na tela.
 */
const ROOT = "https://vlibras.gov.br/app";
const MOVE_IDS = ["vlibras-access-wrapper", "vlibras-app-root"];

declare global {
  interface Window {
    VLibras?: { Widget: new (rootPath: string) => unknown };
  }
}

export function loadVLibras() {
  if (document.getElementById("vlibras-script")) return;

  const region = document.createElement("aside");
  region.id = "vlibras";
  region.setAttribute("aria-label", "Tradução para Libras (VLibras)");
  document.body.appendChild(region);
  new MutationObserver(() => {
    for (const id of MOVE_IDS) {
      const el = document.getElementById(id);
      if (el && el.parentElement === document.body) region.appendChild(el);
    }
  }).observe(document.body, { childList: true });

  const script = document.createElement("script");
  script.id = "vlibras-script";
  script.src = `${ROOT}/vlibras-plugin.js`;
  script.async = true;
  script.onload = () => {
    if (window.VLibras) new window.VLibras.Widget(ROOT);
  };
  document.body.appendChild(script);
}

/** Espera o fim do carregamento da página e mais um segundo. */
export function loadVLibrasAfterPageLoad() {
  const start = () => window.setTimeout(loadVLibras, 1000);
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}
