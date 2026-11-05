import { ArrowRight } from "lucide-react";
import { m, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { href, sectionHref, type Route } from "@/app/router";
import { AccessibilityPanel } from "@/components/a11y/AccessibilityPanel";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/ui/Logo";
import { navigation, site } from "@/content/site";
import { PREFERENCES_EVENT } from "@/lib/accessibility";
import { cn } from "@/lib/cn";

/**
 * Header fixo. Transparente sobre o vídeo do topo; ao descer a página vira
 * uma barra grafite e se recolhe enquanto a pessoa rola para baixo,
 * voltando ao rolar para cima ou ao receber o foco do teclado.
 *
 * Nas telas internas (agendamento, painel) não há vídeo atrás: o header já
 * nasce sólido. O link da tela atual leva `aria-current="page"`.
 *
 * Acessibilidade: o header nunca cobre o elemento que recebe o foco do
 * teclado (WCAG 2.4.11); se cobrir, a página desce o necessário. O botão
 * "Acessibilidade" fica em todas as telas, sempre no mesmo lugar.
 */
export function Header({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const solid = scrolled || route.name !== "inicio";
  const [tucked, setTucked] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const compact = useCompactNav(barRef);
  const { scrollY } = useScroll();

  useEffect(() => {
    const keepFocusVisible = (event: FocusEvent) => {
      const header = headerRef.current;
      const target = event.target;
      if (!header || !(target instanceof HTMLElement) || header.contains(target)) return;
      // Atalhos de acesso e menu do celular ficam por cima do header.
      if (target.closest(".access-shortcuts, .mobile-menu, .a11y-panel")) return;

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
    setScrolled(y > 24);
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
        className={cn("site-header", solid && "is-solid", compact && "is-compact")}
        animate={{ y: tucked && !menuOpen && !panelOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onFocusCapture={() => setTucked(false)}
      >
        <div ref={barRef} className="container-site site-header-bar">
          <a
            href={sectionHref("#inicio", route)}
            className="site-header-logo"
            aria-label={`${site.name}, voltar ao início`}
          >
            {/* Logo é imagem: altura em px até 64rem, para sobrar espaço com a fonte ampliada. */}
            <Logo className="h-[36px] lg:h-11" />
          </a>

          {/* Destino do atalho "Ir para o menu" (Alt + 2). */}
          <div id="menu-principal" tabIndex={-1} className="site-header-menu">
            <nav aria-label="Principal" className="site-nav">
              <ul>
                {navigation.map((item) => (
                  <li key={item.href}>
                    <a
                      href={sectionHref(item.href, route)}
                      className="nav-link"
                      aria-current={item.href === href(route.name) ? "page" : undefined}
                    >
                      <span className="nav-link-roll">
                        <span>{item.label}</span>
                        <span aria-hidden="true">{item.label}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <AccessibilityPanel open={panelOpen} onOpenChange={setPanelOpen} />

            <a
              href={href("agendar")}
              className="button button-small site-header-action"
              aria-current={route.name === "agendar" ? "page" : undefined}
            >
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

      <MobileMenu open={menuOpen} onClose={closeMenu} route={route} />
    </>
  );
}

/**
 * O menu completo cabe na barra? Com a fonte ampliada (até 150%) ou numa
 * tela média, os links podem não caber: aí a barra passa a mostrar só
 * "Menu", como no celular, em vez de cortar ou empurrar itens para fora
 * (WCAG 1.4.4 e 1.4.10). A medida é refeita ao mudar a largura ou o
 * tamanho do texto, antes do desenho (sem piscar).
 */
function useCompactNav(barRef: RefObject<HTMLElement | null>) {
  const [compact, setCompact] = useState(false);
  const [measure, setMeasure] = useState(0);

  // Pede uma medida nova: volta ao menu completo e confere se transborda.
  useEffect(() => {
    let frame = 0;
    const remeasure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setCompact(false);
        setMeasure((count) => count + 1);
      });
    };
    window.addEventListener("resize", remeasure);
    window.addEventListener(PREFERENCES_EVENT, remeasure);
    document.fonts?.ready.then(remeasure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener(PREFERENCES_EVENT, remeasure);
    };
  }, []);

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar || compact) return;
    if (bar.scrollWidth > bar.clientWidth + 1) setCompact(true);
  }, [barRef, compact, measure]);

  return compact;
}
