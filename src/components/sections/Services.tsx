import cornerPhoto from "@/assets/images/footage/corner-69.webp";
import { services } from "@/content/services";
import { whatsappLink } from "@/lib/whatsapp";

/** Serviços como uma tabela de critérios: cada linha abre um orçamento no WhatsApp. */
export function Services() {
  return (
    <section id="servicos" className="services">
      <div className="container-site">
        <h2 className="services-title type-head" data-reveal="drift">
          Do carro de rua <br className="hidden md:block" />
          ao carro de pista.
        </h2>

        <div className="grid-site services-grid">
          <figure className="services-photo" data-reveal="shutter">
            <div className="shutter">
              <img src={cornerPhoto} alt="" width={960} height={1200} loading="lazy" />
            </div>
            <figcaption>O 350Z #69 da equipe contornando a curva.</figcaption>
          </figure>

          <ul className="services-list">
            {services.map((service, index) => {
              const startsGroup = services[index - 1]?.group !== service.group;
              return (
                <li
                  key={service.title}
                  className="service-row"
                  data-group-start={startsGroup || undefined}
                  data-reveal="rise"
                  style={{ "--reveal-order": index % 4 } as React.CSSProperties}
                >
                  <span className="service-group">{startsGroup ? service.group : ""}</span>
                  <div>
                    <h3 className="service-name">{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                  </div>
                  <a
                    className="service-quote text-link"
                    href={whatsappLink(
                      `Olá! Quero um orçamento de ${service.title.toLowerCase()}.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Pedir orçamento de ${service.title.toLowerCase()} pelo WhatsApp`}
                  >
                    Orçar
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
