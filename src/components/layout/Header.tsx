import { ArrowRight } from "lucide-react";
import { m, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/ui/Logo";
import { navigation, site } from "@/content/site";
import { cn } from "@/lib/cn";

/**
 * Header fixo. Transparente sobre o vídeo do topo; ao descer a página vira
 * uma barra grafite e se recolhe enquanto a pessoa rola para baixo,
 * voltando ao rolar para cima ou ao receber o foco do teclado.
 *
 * Acessibilidade: o header nunca cobre o elemento que recebe o foco do
 * teclado (WCAG 2.4.11); se cobrir, a página desce o necessário.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [tucked, setTucked] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    const keepFocusVisible = (event: FocusEvent) => {
      const header = headerRef.current;
      const target = event.target;
      if (!header || !(target instanceof HTMLElement) || header.contains(target)) return;
      // Atalhos de acesso e menu do celular ficam por cima do header.
      if (target.closest(".access-shortcuts, .mobile-menu")) return;

      const headerBottom = header.getBoundingClientRect().bottom;
      const { top } = target.getBoundingClientRect();
      if (headerBottom > 0 && top < headerBottom) {
        window.scrollBy({ top: top - headerBottom - 16, behavior: "instant" });
      }
    };

    document.addEventListener("focusin", keepFocusVisible);
    return () => document.removeEventListener("focusin", keepFocusVisible);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setSolid(y > 24);
    setTucked(y > previous && y > window.innerHeight * 0.6);
  });

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  return (
    <>
      <m.header
        ref={headerRef}
        className={cn("site-header", solid && "is-solid")}
        animate={{ y: tucked && !menuOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onFocusCapture={() => setTucked(false)}
      >
        <div className="container-site site-header-bar">
          <a
            href="#inicio"
            className="site-header-logo"
            aria-label={`${site.name}, voltar ao início`}
          >
            <Logo className="h-10 sm:h-11" />
          </a>

          {/* Destino do atalho "Ir para o menu" (Alt + 2). */}
          <div id="menu-principal" tabIndex={-1} className="site-header-menu">
            <nav aria-label="Principal" className="site-nav">
              <ul>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className="nav-link">
                      <span className="nav-link-roll">
                        <span>{item.label}</span>
                        <span aria-hidden="true">{item.label}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <a href="#contato" className="button button-small site-header-action">
              {site.primaryAction}
              <ArrowRight className="button-arrow" size={16} aria-hidden="true" />
            </a>

            <button
              ref={menuButtonRef}
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              onClick={() => setMenuOpen(true)}
            >
              Menu
            </button>
          </div>
        </div>
      </m.header>

      <MobileMenu open={menuOpen} onClose={closeMenu} />
    </>
  );
}
