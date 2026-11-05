import { sectionHref, type Route } from "@/app/router";

/**
 * Atalhos de acesso no padrão do eMAG (Modelo de Acessibilidade em Governo
 * Eletrônico), o mesmo usado nos sites gov.br:
 *
 *   Alt + 1  conteúdo · Alt + 2  menu · Alt + 3  contato · Alt + 4  rodapé
 *
 * (No Firefox: Alt + Shift + número; no Mac: Control + Option + número.)
 * Os links ficam invisíveis até receberem o foco do teclado (primeiro Tab).
 * Nas telas internas, "Ir para o contato" abre a página inicial no contato.
 */
const shortcuts = [
  { key: "1", href: "#conteudo", label: "Ir para o conteúdo" },
  { key: "2", href: "#menu-principal", label: "Ir para o menu" },
  { key: "3", href: "#contato", label: "Ir para o contato" },
  { key: "4", href: "#rodape", label: "Ir para o rodapé" },
] as const;

export function AccessShortcuts({ route }: { route: Route }) {
  return (
    <nav className="access-shortcuts" aria-label="Atalhos de acessibilidade">
      <ul>
        {shortcuts.map((shortcut) => (
          <li key={shortcut.key}>
            <a href={sectionHref(shortcut.href, route)} accessKey={shortcut.key}>
              {shortcut.label}
              <kbd aria-hidden="true">{shortcut.key}</kbd>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
