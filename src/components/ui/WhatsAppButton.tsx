import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/whatsapp";

/** Botão fixo no canto da tela para iniciar conversa no WhatsApp. */
export function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Olá! Vim pelo site da NSC Garage e gostaria de mais informações.")}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label="Conversar pelo WhatsApp"
    >
      <MessageCircle size={26} aria-hidden="true" />
    </a>
  );
}
