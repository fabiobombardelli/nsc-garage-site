import { ArrowRight, Plus } from "lucide-react";
import { m } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { href } from "@/app/router";
import { services } from "@/content/services";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Serviços: o carrinho de ferramentas vermelho do box. Cada serviço é uma
 * gaveta que abre no lugar, com o que costuma estar incluído, o atalho para
 * agendar a avaliação já com o serviço escolhido e o pedido de orçamento
 * pelo WhatsApp.
 *
 * Acessibilidade: padrão "accordion" do WAI-ARIA. Cada gaveta é um botão
 * com aria-expanded que controla a sua região; gavetas fechadas saem da
 * página (atributo hidden) ao terminar de fechar.
 */
export function Services() {
  const [openId, setOpenId] = useState<string | null>(services[0]?.id ?? null);

  return (
    <section id="servicos" className="services" aria-labelledby="servicos-title">
      <div className="tool-chest">
        <h2 id="servicos-title" className="tool-chest-title">
          Serviços
        </h2>

        <ul className="drawers">
          {services.map((service) => {
            const open = openId === service.id;
            const panelId = `gaveta-${service.id}`;
            const buttonId = `gaveta-${service.id}-botao`;

            return (
              <li key={service.id} className="drawer" data-open={open}>
                <h3 className="drawer-heading">
                  <button
                    id={buttonId}
                    type="button"
                    className="drawer-front"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenId(open ? null : service.id)}
                  >
                    <span className="drawer-label">{service.title}</span>
                    <span className="drawer-group">{service.group}</span>
                    <Plus className="drawer-icon" size={20} aria-hidden="true" />
                  </button>
                </h3>

                <DrawerPanel id={panelId} labelledBy={buttonId} open={open}>
                  <p>{service.description}</p>
                  <ul className="drawer-includes" aria-label="Normalmente inclui">
                    {service.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="drawer-actions">
                    <a
                      className="button button-small"
                      href={href("agendar", { servico: service.id })}
                    >
                      Agendar avaliação
                      <span className="sr-only-text"> de {service.title.toLowerCase()}</span>
                      <ArrowRight className="button-arrow" size={16} aria-hidden="true" />
                    </a>
                    <a
                      className="drawer-quote text-link"
                      href={whatsappLink(
                        `Olá! Quero um orçamento de ${service.title.toLowerCase()}.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Pedir orçamento pelo WhatsApp
                      <ArrowRight size={16} aria-hidden="true" />
                      <span className="sr-only-text"> (abre em nova aba)</span>
                    </a>
                  </div>
                </DrawerPanel>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

type DrawerPanelProps = {
  id: string;
  labelledBy: string;
  open: boolean;
  children: ReactNode;
};

/** Interior da gaveta: abre deslizando e, depois de fechar, sai da página. */
function DrawerPanel({ id, labelledBy, open, children }: DrawerPanelProps) {
  const [hidden, setHidden] = useState(!open);

  useEffect(() => {
    if (open) setHidden(false);
  }, [open]);

  return (
    <m.div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      className="drawer-body"
      hidden={hidden}
      initial={false}
      animate={{ height: open ? "auto" : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (!open) setHidden(true);
      }}
    >
      <div className="drawer-inner">{children}</div>
    </m.div>
  );
}
