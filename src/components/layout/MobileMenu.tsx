import { AnimatePresence, m } from "motion/react";
import { useEffect, useRef } from "react";
import { href, sectionHref, type Route } from "@/app/router";
import { Logo } from "@/components/ui/Logo";
import { contact, navigation, site } from "@/content/site";

type MobileMenuProps = {
  open: boolean;
  /** Fecha o menu e devolve o foco ao botão "Menu". */
  onClose: () => void;
  route: Route;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Menu do celular em tela cheia. É um diálogo modal: o foco fica preso
 * dentro dele, Esc fecha e a página atrás não rola enquanto está aberto.
 */
export function MobileMenu({ open, onClose, route }: MobileMenuProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      // Mantém o Tab circulando dentro do menu.
      const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <m.div
          ref={dialogRef}
          id="menu-mobile"
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mobile-menu-top">
            <Logo className="h-10" />
            <button type="button" className="menu-toggle" onClick={onClose}>
              Fechar
            </button>
          </div>

          <nav aria-label="Menu" className="mobile-menu-nav">
            <ul>
              {navigation.map((item, index) => (
                <m.li
                  key={item.href}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 0.08 + index * 0.07,
                  }}
                >
                  <a
                    href={sectionHref(item.href, route)}
                    className="mobile-menu-link"
                    aria-current={item.href === href(route.name) ? "page" : undefined}
                    onClick={onClose}
                  >
                    {item.label}
                  </a>
                </m.li>
              ))}
            </ul>
          </nav>

          <div className="mobile-menu-footer">
            <a href={href("agendar")} className="button w-full" onClick={onClose}>
              {site.primaryAction}
            </a>
            <p>
              WhatsApp {contact.whatsapp.display}
              <br />
              {contact.address.street}, {contact.address.city}
            </p>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
