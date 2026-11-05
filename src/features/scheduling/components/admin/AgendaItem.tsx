import { MessageCircle } from "lucide-react";
import { useRef, useState } from "react";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import { whatsappLinkTo } from "@/lib/whatsapp";
import { schedulingService } from "../..";
import { formatTime } from "../../domain/calendar";
import { STATUS_LABEL, TRANSITIONS, TRANSITION_ACTION } from "../../domain/status";
import type { Appointment, AppointmentStatus } from "../../domain/types";
import { statusMessage } from "../../services/messages";
import { AppointmentFacts } from "../AppointmentFacts";
import { RatingStars } from "../RatingStars";
import { StatusBadge } from "../StatusBadge";

type AgendaItemProps = {
  appointment: Appointment;
  /** Avisa a página que a situação mudou (mensagem de status e manter o item visível). */
  onChanged: (appointment: Appointment, message: string) => void;
};

/**
 * Um atendimento na agenda da oficina (UC-17 Gerenciar Agenda). Os botões
 * são só as transições que a máquina de estados permite a partir da
 * situação atual (RN-06). Depois de mudar, o foco vai para "Avisar cliente
 * pelo WhatsApp", o próximo passo natural.
 */
export function AgendaItem({ appointment, onChanged }: AgendaItemProps) {
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const notifyRef = useRef<HTMLAnchorElement>(null);
  const titleId = `item-${appointment.protocol}`;

  const change = async (to: AppointmentStatus) => {
    setBusy(true);
    setError(null);
    try {
      const changed = await schedulingService.changeStatus(appointment.protocol, to);
      setConfirmingCancel(false);
      onChanged(
        changed,
        `Agendamento de ${changed.customer.name} agora está ${STATUS_LABEL[to].toLowerCase()}.`,
      );
      requestAnimationFrame(() => notifyRef.current?.focus());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível mudar a situação.");
    } finally {
      setBusy(false);
    }
  };

  const transitions = TRANSITIONS[appointment.status];

  return (
    <article className="agenda-item" aria-labelledby={titleId} data-status={appointment.status}>
      <h3 id={titleId} className="agenda-item-title">
        <span className="agenda-item-time">{formatTime(appointment.time)}</span>
        <span className="sr-only-text">, </span>
        <span className="agenda-item-name">{appointment.customer.name}</span>
      </h3>
      <div className="agenda-item-status">
        <StatusBadge status={appointment.status} />
      </div>

      <div className="agenda-item-body">
        <AppointmentFacts
          appointment={appointment}
          facts={["servico", "carro", "telefone", "protocolo", "observacoes"]}
        />
        {appointment.rating && (
          <p className="agenda-item-rating">
            Avaliação do cliente: <RatingStars score={appointment.rating.score} />
            {appointment.rating.comment && <span> · “{appointment.rating.comment}”</span>}
          </p>
        )}
        {error && <p className="appointment-card-error">{error}</p>}

        {confirmingCancel ? (
          <InlineConfirm
            question={`Cancelar o atendimento de ${appointment.customer.name} às ${formatTime(appointment.time)}? O horário volta para a agenda.`}
            confirmLabel="Sim, cancelar"
            cancelLabel="Não, manter"
            busy={busy}
            onConfirm={() => change("cancelado")}
            onCancel={() => setConfirmingCancel(false)}
          />
        ) : (
          <div className="agenda-item-actions">
            {transitions.map((to) => (
              <button
                key={to}
                type="button"
                className={
                  to === "cancelado" ? "button button-small button-outline" : "button button-small"
                }
                aria-disabled={busy || undefined}
                onClick={() => {
                  if (busy) return;
                  if (to === "cancelado") setConfirmingCancel(true);
                  else void change(to);
                }}
              >
                {TRANSITION_ACTION[to]}
              </button>
            ))}
            <a
              ref={notifyRef}
              className="text-link agenda-item-notify"
              href={whatsappLinkTo(appointment.customer.phone, statusMessage(appointment))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Avisar cliente pelo WhatsApp
              <span className="sr-only-text"> (abre em nova aba)</span>
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
