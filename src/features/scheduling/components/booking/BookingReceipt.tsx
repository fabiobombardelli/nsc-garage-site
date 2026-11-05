import { Check, Copy, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { href } from "@/app/router";
import { DonutFinish } from "@/components/car/DonutFinish";
import { whatsappLink } from "@/lib/whatsapp";
import type { Appointment } from "../../domain/types";
import { receiptMessage } from "../../services/messages";
import { AppointmentFacts } from "../AppointmentFacts";
import { StatusBadge } from "../StatusBadge";

type BookingReceiptProps = {
  appointment: Appointment;
  onBookAnother: () => void;
};

/**
 * Comprovante (RF-016): o protocolo em destaque, o resumo e os próximos
 * passos. O carro comemora com um "zerinho" em volta do cone.
 */
export function BookingReceipt({ appointment, onBookAnother }: BookingReceiptProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const copyProtocol = async () => {
    try {
      await navigator.clipboard.writeText(appointment.protocol);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="receipt" aria-labelledby="comprovante-titulo">
      <div className="receipt-scene">
        <DonutFinish />
      </div>

      <div className="receipt-body">
        <div className="receipt-head">
          <h2 id="comprovante-titulo" ref={titleRef} className="receipt-title" tabIndex={-1}>
            Horário reservado
          </h2>
          <StatusBadge status={appointment.status} />
        </div>
        <p className="receipt-lead">
          A oficina vai confirmar pelo WhatsApp. Guarde o protocolo: com ele e o seu telefone você
          acompanha, cancela ou avalia o atendimento.
        </p>

        <div className="receipt-protocol">
          <dl>
            <dt>Protocolo</dt>
            <dd className="receipt-protocol-code">{appointment.protocol}</dd>
          </dl>
          <button
            type="button"
            className="button button-small button-on-light"
            onClick={copyProtocol}
          >
            {copied ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Copy size={16} aria-hidden="true" />
            )}
            {copied ? "Copiado" : "Copiar protocolo"}
          </button>
        </div>
        <p className="sr-only-text" role="status">
          {copied ? "Protocolo copiado." : ""}
        </p>

        <AppointmentFacts
          appointment={appointment}
          facts={["servico", "quando", "carro", "cliente"]}
        />

        <div className="receipt-actions">
          <a
            className="button"
            href={whatsappLink(receiptMessage(appointment))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Enviar comprovante pelo WhatsApp
            <span className="sr-only-text"> (abre em nova aba)</span>
          </a>
          <a
            className="button button-outline"
            href={href("meusAgendamentos", { protocolo: appointment.protocol })}
          >
            Acompanhar agendamento
          </a>
          <button type="button" className="text-link receipt-again" onClick={onBookAnother}>
            Agendar outro horário
          </button>
        </div>
      </div>
    </section>
  );
}
