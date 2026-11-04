import type { FormEvent } from "react";
import { services } from "@/content/services";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Formulário sem servidor: monta uma mensagem com os dados preenchidos e
 * abre a conversa no WhatsApp da oficina.
 */
export function ContactForm() {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();

    const message = [
      `Olá! Meu nome é ${field("name")}.`,
      field("car") && `Carro: ${field("car")}`,
      field("service") && `Serviço: ${field("service")}`,
      field("message"),
    ]
      .filter(Boolean)
      .join("\n");

    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  };

  return (
    <form className="coupon-form" onSubmit={handleSubmit}>
      <label className="sr-only-text" htmlFor="contact-name">
        Nome
      </label>
      <input
        id="contact-name"
        name="name"
        type="text"
        autoComplete="name"
        required
        placeholder="Seu nome"
      />

      <label className="sr-only-text" htmlFor="contact-car">
        Carro
      </label>
      <input id="contact-car" name="car" type="text" placeholder="Carro, modelo e ano" />

      <label className="sr-only-text" htmlFor="contact-service">
        Serviço
      </label>
      <select id="contact-service" name="service" defaultValue="">
        <option value="">Serviço de interesse</option>
        {services.map((service) => (
          <option key={service.title} value={service.title}>
            {service.title}
          </option>
        ))}
        <option value="Outro">Outro</option>
      </select>

      <label className="sr-only-text" htmlFor="contact-message">
        Mensagem
      </label>
      <textarea
        id="contact-message"
        name="message"
        rows={3}
        required
        placeholder="O que o carro precisa?"
      />

      <button type="submit" className="button coupon-submit">
        Enviar pelo WhatsApp
      </button>
    </form>
  );
}
