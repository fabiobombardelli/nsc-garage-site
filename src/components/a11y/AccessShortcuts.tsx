import type { MouseEvent } from "react";
import { sectionHref, type Route } from "@/app/router";

/**
 * Atalhos de acesso no padrão do eMAG (Modelo de Acessibilidade em Governo
 * Eletrônico), o mesmo usado nos sites gov.br:
 *
 *   Alt + 1  conteúdo · Alt + 2  menu · Alt + 3  contato · Alt + 4  rodapé
 *
 * (No Firefox: Alt + Shift + número; no Mac: Control + Option + número.)
 * Os links ficam invisíveis até receberem o foco do teclado (primeiro Tab).
 * Conteúdo, menu e rodapé existem em todas as telas: o atalho pula dentro da
 * tela atual (WCAG 2.4.1), sem trocar de tela nem perder o que foi preenchido.
 * Só "Ir para o contato" abre a página inicial, que é onde o contato fica.
 */
const shortcuts = [
  { key: "1", href: "#conteudo", label: "Ir para o conteúdo", everyScreen: true },
  { key: "2", href: "#menu-principal", label: "Ir para o menu", everyScreen: true },
  { key: "3", href: "#contato", label: "Ir para o contato", everyScreen: false },
  { key: "4", href: "#rodape", label: "Ir para o rodapé", everyScreen: true },
] as const;

/** Nas telas internas, a âncora como hash trocaria de tela (o roteador usa o hash). */
function jumpWithinScreen(event: MouseEvent<HTMLAnchorElement>, id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: "start" });
}

export function AccessShortcuts({ route }: { route: Route }) {
  const internal = route.name !== "inicio";
  return (
    <nav className="access-shortcuts" aria-label="Atalhos de acessibilidade">
      <ul>
        {shortcuts.map((shortcut) => (
          <li key={shortcut.key}>
            <a
              href={sectionHref(shortcut.href, route)}
              accessKey={shortcut.key}
              onClick={
                internal && shortcut.everyScreen
                  ? (event) => jumpWithinScreen(event, shortcut.href.slice(1))
                  : undefined
              }
            >
              {shortcut.label}
              <kbd aria-hidden="true">{shortcut.key}</kbd>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
