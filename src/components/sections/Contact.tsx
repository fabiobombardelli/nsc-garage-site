import { href } from "@/app/router";
import { WorkOrderForm } from "@/components/contact/WorkOrderForm";
import { MaskedLine } from "@/components/ui/Reveal";

/**
 * Contato (UC-04 Enviar Mensagem de Contato): a ordem de serviço do box,
 * um cupom com picote que monta a mensagem e abre o WhatsApp. Quem já sabe
 * o que quer vai direto para o agendamento.
 */
export function Contact() {
  return (
    <section id="contato" tabIndex={-1} className="contact" aria-labelledby="contato-title">
      <div className="container-site grid-site">
        <div className="work-order">
          <div className="work-order-intro">
            <h2 id="contato-title" className="type-head">
              <MaskedLine>Ordem de</MaskedLine> <MaskedLine delay={0.08}>serviço</MaskedLine>
            </h2>
            <div className="work-order-copy">
              <p>
                Conte qual é o carro e o que ele precisa. A equipe responde pelo WhatsApp para
                marcar a avaliação.
              </p>
              <p>
                Já sabe o dia?{" "}
                <a className="text-link" href={href("agendar")}>
                  Escolha o horário na agenda
                </a>
                .
              </p>
            </div>
          </div>
          <span className="perforation" aria-hidden="true">
            <span />
          </span>
          <WorkOrderForm />
        </div>
      </div>
    </section>
  );
}
