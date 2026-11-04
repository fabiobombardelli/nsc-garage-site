import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { navigation, site } from "@/content/site";
import { cn } from "@/lib/cn";

/** Barra simples: logo, três links e a ação principal. No celular, os links ficam atrás de "Menu". */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className={cn("site-header", menuOpen && "is-open")}>
      <div className="container-site site-header-bar">
        <a href="#inicio" aria-label={`${site.name}, início`} onClick={closeMenu}>
          <Logo className="h-9 sm:h-10" />
        </a>

        <nav aria-label="Navegação principal" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="header-link">
              {item.label}
            </a>
          ))}
          <a href="#contato" className="button button-small">
            {site.primaryAction}
          </a>
        </nav>

        <button
          type="button"
          className="header-link md:hidden"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Fechar" : "Menu"}
        </button>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Navegação"
        className="mobile-menu md:hidden"
        hidden={!menuOpen}
      >
        {navigation.map((item) => (
          <a key={item.href} href={item.href} className="mobile-menu-link" onClick={closeMenu}>
            {item.label}
          </a>
        ))}
        <a href="#contato" className="button mt-6 w-full" onClick={closeMenu}>
          {site.primaryAction}
        </a>
      </nav>
    </header>
  );
}
