import { ContactForm } from "@/components/contact/ContactForm";

/** A ficha de inscrição: um cupom com picote, que envia os dados pelo WhatsApp. */
export function Contact() {
  return (
    <section id="contato" className="contact">
      <div className="container-site grid-site">
        <div className="coupon">
          <div className="coupon-intro">
            <h2 className="type-head" data-reveal="drift">
              Inscreva <br />
              seu carro
            </h2>
            <p>
              Conte qual é o carro e o que ele precisa. A equipe responde pelo WhatsApp para marcar
              a avaliação.
            </p>
          </div>
          <span className="coupon-perforation" aria-hidden="true">
            <span />
          </span>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
