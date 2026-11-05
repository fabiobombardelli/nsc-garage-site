import { useEffect, useRef, type FormEvent } from "react";
import { FieldError } from "@/components/forms/Field";
import { serviceTitle } from "@/content/services";
import { formatLongDate, formatTime } from "../../domain/calendar";
import { formatPhone, normalizePhone } from "../../domain/validation";
import type { BookingDraft, StepIndex } from "./model";
import { StepHeading, StepNav } from "./StepParts";

export type ReviewError = { message: string; retryStep?: StepIndex };

type ReviewStepProps = {
  draft: BookingDraft;
  busy: boolean;
  error: ReviewError | null;
  onEdit: (step: StepIndex) => void;
  onConfirm: () => void;
  onBack: () => void;
  focusOnMount: boolean;
};

/**
 * Etapa 4: revisão antes de gravar. A pessoa confere tudo e pode voltar a
 * qualquer etapa pelo botão "Alterar" da linha (prevenção de erros,
 * WCAG 3.3.4). Nada é gravado antes de "Confirmar agendamento".
 */
export function ReviewStep({
  draft,
  busy,
  error,
  onEdit,
  onConfirm,
  onBack,
  focusOnMount,
}: ReviewStepProps) {
  const errorRef = useRef<HTMLDivElement>(null);
  const { customer } = draft;

  // Erro ao gravar (horário ocupado no último segundo): o foco vai para a mensagem.
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const rows: Array<{ label: string; value: string; step: StepIndex }> = [
    { label: "Serviço", value: draft.serviceId ? serviceTitle(draft.serviceId) : "", step: 0 },
    {
      label: "Quando",
      value:
        draft.date && draft.time
          ? `${formatLongDate(draft.date)}, às ${formatTime(draft.time)}`
          : "",
      step: 1,
    },
    { label: "Nome", value: customer.name, step: 2 },
    { label: "Telefone", value: formatPhone(normalizePhone(customer.phone)), step: 2 },
    { label: "E-mail", value: customer.email, step: 2 },
    {
      label: "Carro",
      value: [customer.vehicleModel, customer.vehicleYear].filter(Boolean).join(" "),
      step: 2,
    },
    { label: "Observações", value: customer.notes, step: 2 },
  ];

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!busy) onConfirm();
  };

  return (
    <form className="booking-form" noValidate onSubmit={handleSubmit}>
      <StepHeading step={3} focusOnMount={focusOnMount}>
        Confira e confirme
      </StepHeading>
      <p className="step-help">
        O pedido chega à oficina como pendente. A equipe confirma o horário pelo WhatsApp.
      </p>

      <dl className="review-list">
        {rows
          .filter((row) => row.value.trim())
          .map((row) => (
            <div key={row.label} className="review-row">
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
              <dd className="review-edit">
                <button type="button" className="text-link" onClick={() => onEdit(row.step)}>
                  Alterar<span className="sr-only-text"> {row.label.toLowerCase()}</span>
                </button>
              </dd>
            </div>
          ))}
      </dl>

      {error && (
        <div ref={errorRef} className="review-error" tabIndex={-1}>
          <FieldError>{error.message}</FieldError>
          {error.retryStep !== undefined && (
            <button
              type="button"
              className="button button-small"
              onClick={() => onEdit(error.retryStep as StepIndex)}
            >
              Escolher outro horário
            </button>
          )}
        </div>
      )}

      <StepNav onBack={onBack} nextLabel="Confirmar agendamento" busy={busy} />
    </form>
  );
}
