import { DonutCar } from "@/components/footer/DonutCar";
import { Logo } from "@/components/ui/Logo";
import { contact, navigation, site } from "@/content/site";
import { whatsappLink } from "@/lib/whatsapp";

/** O fechamento em campo vermelho: o número do WhatsApp é o título. */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer id="rodape" className="site-footer">
      <div className="container-site site-footer-inner">
        <div className="site-footer-top">
          <Logo className="h-10" />
          <div className="site-footer-notes">
            <p>{site.description}</p>
            <p>
              {contact.address.street}
              <br />
              {contact.address.city}
            </p>
            <p>
              {contact.hours.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>
          <a href="#inicio" className="text-link site-footer-top-link">
            Voltar ao início
          </a>
        </div>

        <DonutCar />

        <div className="site-footer-contact">
          <h2 className="type-lead">Chame no WhatsApp</h2>
          <a
            className="site-footer-number"
            href={whatsappLink("Olá! Vim pelo site da NSC Garage.")}
            target="_blank"
            rel="noopener noreferrer"
          >
            {contact.whatsapp.display}
          </a>
        </div>

        <div className="site-footer-meta">
          <nav aria-label="Rodapé" className="site-footer-links">
            {navigation.map((item) => (
              <a key={item.href} href={item.href} className="text-link">
                {item.label}
              </a>
            ))}
            {contact.instagram && (
              <a
                href={`https://instagram.com/${contact.instagram}`}
                className="text-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
          </nav>
          <p>
            © {year} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
