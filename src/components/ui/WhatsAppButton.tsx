import { MessageCircle } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/whatsapp";

/**
 * Atalho fixo para o WhatsApp. Só aparece entre o topo e o rodapé (que já
 * têm a ação e o número na tela); some e volta com uma escala curta.
 */
export function WhatsAppButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const watched = ["inicio", "rodape"]
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);
    const onScreen = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
        setVisible(onScreen.size === 0);
      },
      { threshold: 0.15 },
    );
    watched.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <m.a
          href={whatsappLink("Olá! Vim pelo site da NSC Garage e gostaria de mais informações.")}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-button"
          aria-label="Conversar pelo WhatsApp (abre em nova aba)"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <MessageCircle size={24} aria-hidden="true" />
        </m.a>
      )}
    </AnimatePresence>
  );
}
