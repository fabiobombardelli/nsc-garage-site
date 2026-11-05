import { useRef, useState } from "react";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import { schedulingRules } from "@/content/scheduling";
import { serviceTitle } from "@/content/services";
import { whatsappLink } from "@/lib/whatsapp";
import { schedulingService } from "../..";
import { formatLongDate, formatTime } from "../../domain/calendar";
import { canCustomerCancel, canRate } from "../../domain/rules";
import { STATUS_DESCRIPTION } from "../../domain/status";
import type { Appointment } from "../../domain/types";
import { AppointmentFacts } from "../AppointmentFacts";
import { RatingStars } from "../RatingStars";
import { StatusBadge } from "../StatusBadge";
import { RatingForm } from "./RatingForm";

type CustomerAppointmentCardProps = {
  appointment: Appointment;
  /** Telefone que a pessoa digitou na consulta (confere a posse do agendamento). */
  phone: string;
  /** Anuncia o resultado de uma ação na região de status da página. */
  onMessage: (message: string) => void;
};

/**
 * Um agendamento na visão do cliente, com as ações que as regras permitem
 * agora: cancelar (UC-16, até 24 h antes) e avaliar (UC-19, depois de
 * concluído). Quando a ação não é permitida, o motivo aparece em texto.
 */
export function CustomerAppointmentCard({
  appointment,
  phone,
  onMessage,
}: CustomerAppointmentCardProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [confirming, setConfirming] = useState(false);
  const [rating, setRating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const titleId = `agendamento-${appointment.protocol}`;
  const formId = `avaliar-${appointment.protocol}`;
  const cancelRule = canCustomerCancel(appointment, new Date(), schedulingRules);
  const rateRule = canRate(appointment);
  const active = appointment.status === "pendente" || appointment.status === "confirmado";
  const when = `${formatLongDate(appointment.date)}, às ${formatTime(appointment.time)}`;

  /** Depois de uma ação, o botão some: o foco volta para o título do cartão. */
  const finish = (message: string) => {
    setConfirming(false);
    setRating(false);
    setBusy(false);
    onMessage(message);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  const cancel = async () => {
    setBusy(true);
    setError(null);
    try {
      await schedulingService.cancelByCustomer(appointment.protocol, phone);
      finish(`Agendamento de ${when} cancelado. O horário foi liberado.`);
    } catch (caught) {
      setBusy(false);
      setConfirming(false);
      setError(caught instanceof Error ? caught.message : "Não foi possível cancelar.");
    }
  };

  return (
    <article className="appointment-card" aria-labelledby={titleId}>
      <header className="appointment-card-head">
        <h3 id={titleId} ref={titleRef} tabIndex={-1} className="appointment-card-title">
          {serviceTitle(appointment.serviceId)}
        </h3>
        <StatusBadge status={appointment.status} />
      </header>

      <AppointmentFacts appointment={appointment} facts={["quando", "carro", "protocolo"]} />
      <p className="appointment-card-note">{STATUS_DESCRIPTION[appointment.status]}</p>

      {appointment.rating && (
        <div className="appointment-card-rating">
          <p>
            Sua avaliação: <RatingStars score={appointment.rating.score} />
          </p>
          {appointment.rating.comment && <p>“{appointment.rating.comment}”</p>}
        </div>
      )}

      {error && <p className="appointment-card-error">{error}</p>}

      {active && !cancelRule.allowed && (
        <p className="appointment-card-note">
          {cancelRule.reason}{" "}
          <a
            className="text-link"
            href={whatsappLink(`Olá! Preciso falar sobre o agendamento ${appointment.protocol}.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Falar com a oficina
            <span className="sr-only-text"> pelo WhatsApp (abre em nova aba)</span>
          </a>
        </p>
      )}

      {cancelRule.allowed &&
        (confirming ? (
          <InlineConfirm
            question={`Cancelar o agendamento de ${when}? O horário fica livre para outra pessoa.`}
            confirmLabel="Sim, cancelar"
            cancelLabel="Não, manter"
            busy={busy}
            onConfirm={cancel}
            onCancel={() => setConfirming(false)}
          />
        ) : (
          <div className="appointment-card-actions">
            <button
              type="button"
              className="button button-small button-outline"
              onClick={() => setConfirming(true)}
            >
              Cancelar agendamento
            </button>
          </div>
        ))}

      {rateRule.allowed && (
        <div className="appointment-card-actions">
          <button
            type="button"
            className="button button-small"
            aria-expanded={rating}
            aria-controls={formId}
            onClick={() => setRating((open) => !open)}
          >
            Avaliar o atendimento
          </button>
        </div>
      )}
      {rateRule.allowed && rating && (
        <div id={formId}>
          <RatingForm appointment={appointment} phone={phone} onDone={finish} />
        </div>
      )}
    </article>
  );
}
