import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { navigation, site } from "@/content/site";
import { useScrolled } from "@/hooks/useScrolled";
import { cn } from "@/lib/cn";

export function Header() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  // Fecha o menu mobile com a tecla Esc.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && closeMenu();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className={cn("site-header", (scrolled || menuOpen) && "is-solid")}>
      <div className="container-site flex items-center justify-between gap-5 py-3">
        <a
          href="#inicio"
          aria-label={`${site.name} — início`}
          className="flex min-w-0 items-center gap-3"
          onClick={closeMenu}
        >
          <Logo className="h-10 sm:h-12" />
          <span className="hidden h-6 w-px bg-foreground/25 lg:block" />
          <span className="hidden text-[10px] font-medium tracking-[0.28em] text-muted-foreground uppercase lg:block">
            {site.tagline}
          </span>
        </a>

        <nav aria-label="Navegação principal" className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => (
            <a key={item.href} href={item.href} className="nav-link">
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className="mobile-menu-toggle md:hidden"
          aria-expanded={menuOpen}
          aria-controls="menu-mobile"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <nav
        id="menu-mobile"
        aria-label="Navegação mobile"
        className={cn("mobile-menu md:hidden", menuOpen && "is-open")}
        hidden={!menuOpen}
      >
        {navigation.map((item) => (
          <a key={item.href} href={item.href} className="mobile-menu-link" onClick={closeMenu}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
