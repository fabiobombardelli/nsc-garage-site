import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Atalho fixo para o WhatsApp. Sai de cena enquanto o topo ou o rodapé
 * (que já têm a ação e o número) estão na tela.
 */
export function WhatsAppButton() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const watched = ["inicio", "rodape"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    const visible = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        setHidden(visible.size > 0);
      },
      { threshold: 0.15 },
    );
    watched.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <a
      href={whatsappLink("Olá! Vim pelo site da NSC Garage e gostaria de mais informações.")}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("whatsapp-button", hidden && "is-hidden")}
      aria-label="Conversar pelo WhatsApp"
      tabIndex={hidden ? -1 : undefined}
    >
      <MessageCircle size={24} aria-hidden="true" />
    </a>
  );
}
