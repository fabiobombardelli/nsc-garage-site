import { m, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { FigureEight } from "@/components/footer/FigureEight";
import { contact, navigation, site } from "@/content/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Rodapé: o campo vermelho do carrinho de ferramentas. O nome volta em
 * largura total (crescendo levemente quando chega), seguido das formas de
 * contato e do 350Z fazendo oitos.
 */
export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const wordmarkScale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const year = new Date().getFullYear();

  return (
    <footer
      id="rodape"
      ref={ref}
      tabIndex={-1}
      className="site-footer"
      aria-labelledby="rodape-title"
    >
      <div className="container-site footer-inner">
        <m.h2
          id="rodape-title"
          className="footer-wordmark"
          style={reduceMotion ? undefined : { scale: wordmarkScale }}
        >
          {site.name}
        </m.h2>

        <div className="footer-main grid-site">
          <div className="footer-places">
            <a
              className="footer-place"
              href={whatsappLink("Olá! Vim pelo site da NSC Garage.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="footer-place-label">WhatsApp</span>
              {contact.whatsapp.display}
              <span className="sr-only-text"> (abre em nova aba)</span>
            </a>
            <p className="footer-place">
              <span className="footer-place-label">Endereço</span>
              {contact.address.street}, {contact.address.city}
            </p>
            {contact.instagram && (
              <a
                className="footer-place"
                href={`https://instagram.com/${contact.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="footer-place-label">Instagram</span>@{contact.instagram}
              </a>
            )}
            <p className="footer-hours">
              {contact.hours.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          <FigureEight />
        </div>

        <div className="footer-legal">
          <p>
            © {year} {site.name}
          </p>
          <nav aria-label="Rodapé" className="footer-links">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="text-link">
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#inicio" className="text-link">
            Voltar ao início
          </a>
        </div>
      </div>
    </footer>
  );
}
