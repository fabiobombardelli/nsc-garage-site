import { Send } from "lucide-react";
import type { FormEvent } from "react";
import { services } from "@/content/services";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Formulário sem servidor: monta uma mensagem com os dados preenchidos
 * e abre a conversa no WhatsApp da oficina.
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
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="field">
          <span>Nome</span>
          <input name="name" type="text" autoComplete="name" required placeholder="Seu nome" />
        </label>

        <label className="field">
          <span>Carro</span>
          <input name="car" type="text" placeholder="Modelo e ano" />
        </label>
      </div>

      <label className="field">
        <span>Serviço de interesse</span>
        <select name="service" defaultValue="">
          <option value="">Selecione (opcional)</option>
          {services.map((service) => (
            <option key={service.title} value={service.title}>
              {service.title}
            </option>
          ))}
          <option value="Outro">Outro</option>
        </select>
      </label>

      <label className="field">
        <span>Mensagem</span>
        <textarea
          name="message"
          rows={5}
          required
          placeholder="Conte um pouco sobre o seu projeto ou o que o carro precisa."
        />
      </label>

      <button type="submit" className="btn btn-primary">
        Enviar pelo WhatsApp <Send size={16} aria-hidden="true" />
      </button>
    </form>
  );
}
