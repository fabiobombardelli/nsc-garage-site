/** Pequenos atalhos para montar DOM e SVG sem framework. */

type Attrs = Record<string, string | number | boolean | null | undefined>;
type Child = Node | string | number | null | undefined | false;

function applyAttrs(element: Element, attrs: Attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") element.setAttribute("class", String(value));
    else if (key === "html") element.innerHTML = String(value);
    else element.setAttribute(key, value === true ? "" : String(value));
  }
}

function appendChildren(element: Element, children: Child[]) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    element.append(typeof child === "number" ? String(child) : child);
  }
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  applyAttrs(element, attrs);
  appendChildren(element, children);
  return element;
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function s<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: Child[]
): SVGElementTagNameMap[K] {
  const element = document.createElementNS(SVG_NS, tag);
  applyAttrs(element, attrs);
  appendChildren(element, children);
  return element;
}

/** Linha que sobe de dentro de uma máscara (o gesto de entrada do site). */
export function maskLine(text: string, className = ""): HTMLElement {
  return h("span", { class: `mask ${className}` }, h("span", { class: "mask-inner" }, text));
}

/** Lê um parâmetro da busca (?x=) ou da busca dentro do hash (#/rota?x=). */
export function param(name: string): string | null {
  const fromSearch = new URLSearchParams(location.search).get(name);
  if (fromSearch) return fromSearch;
  const hashQuery = location.hash.split("?")[1];
  return hashQuery ? new URLSearchParams(hashQuery).get(name) : null;
}

/** Espera os recursos de uma lista de imagens (sem travar se alguma falhar). */
export function preload(urls: readonly string[]): Promise<void> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();
          image.onload = image.onerror = () => resolve();
          image.src = url;
        }),
    ),
  ).then(() => undefined);
}
