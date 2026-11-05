import { useCallback, useState } from "react";
import { PitLane } from "@/components/car/PitLane";
import { services } from "@/content/services";
import { schedulingService } from "../..";
import type { Appointment } from "../../domain/types";
import type { CustomerErrors } from "../../domain/validation";
import { SchedulingError } from "../../services/schedulingService";
import { BookingReceipt } from "./BookingReceipt";
import { BookingStub } from "./BookingStub";
import { CustomerStep } from "./CustomerStep";
import { DateTimeStep } from "./DateTimeStep";
import { EMPTY_CUSTOMER, LAST_PHONE_KEY, STEPS, type BookingDraft, type StepIndex } from "./model";
import { ReviewStep, type ReviewError } from "./ReviewStep";
import { ServiceStep } from "./ServiceStep";

type BookingWizardProps = {
  /** Serviço já escolhido (link "Agendar este serviço" das gavetas). */
  initialServiceId?: string | null;
};

/**
 * UC-12 Agendar Serviço, em quatro etapas: serviço → dia e horário →
 * dados → revisão. O rascunho fica só na tela até a confirmação; quem
 * grava é o serviço de agendamento, que confere tudo de novo.
 */
export function BookingWizard({ initialServiceId }: BookingWizardProps) {
  const knownService = services.some((service) => service.id === initialServiceId);
  const [step, setStep] = useState<StepIndex>(knownService ? 1 : 0);
  const [navigated, setNavigated] = useState(false);
  const [draft, setDraft] = useState<BookingDraft>({
    serviceId: knownService ? (initialServiceId ?? null) : null,
    date: null,
    time: null,
    customer: EMPTY_CUSTOMER,
  });
  const [customerErrors, setCustomerErrors] = useState<CustomerErrors>({});
  const [reviewError, setReviewError] = useState<ReviewError | null>(null);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState<Appointment | null>(null);

  const goTo = (next: StepIndex) => {
    setNavigated(true);
    setReviewError(null);
    setStep(next);
  };

  const changeDateTime = useCallback(
    (choice: { date: string | null; time: string | null }) =>
      setDraft((current) => ({ ...current, ...choice })),
    [],
  );

  const confirm = async () => {
    const { serviceId, date, time, customer } = draft;
    if (!serviceId || !date || !time) return;
    setBusy(true);
    setReviewError(null);
    try {
      const appointment = await schedulingService.book({ serviceId, date, time, customer });
      try {
        sessionStorage.setItem(LAST_PHONE_KEY, appointment.customer.phone);
      } catch {
        // Sem sessionStorage: a pessoa digita o telefone na consulta.
      }
      setReceipt(appointment);
    } catch (error) {
      if (error instanceof SchedulingError && error.code === "dados-invalidos") {
        setCustomerErrors(error.fieldErrors ?? {});
        goTo(2);
      } else if (error instanceof SchedulingError && error.code === "horario-indisponivel") {
        setDraft((current) => ({ ...current, time: null }));
        setReviewError({ message: error.message, retryStep: 1 });
      } else {
        setReviewError({
          message:
            error instanceof Error ? error.message : "Não foi possível agendar. Tente de novo.",
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const restart = () => {
    setReceipt(null);
    setDraft({ serviceId: null, date: null, time: null, customer: draft.customer });
    goTo(0);
  };

  if (receipt) return <BookingReceipt appointment={receipt} onBookAnother={restart} />;

  return (
    <div className="booking">
      <PitLane steps={STEPS} current={step} />

      <div className="booking-ticket">
        <section className="booking-step" aria-labelledby="etapa-titulo">
          {step === 0 && (
            <ServiceStep
              value={draft.serviceId}
              onChange={(serviceId) => setDraft((current) => ({ ...current, serviceId }))}
              onNext={() => goTo(1)}
              focusOnMount={navigated}
            />
          )}
          {step === 1 && (
            <DateTimeStep
              date={draft.date}
              time={draft.time}
              onChange={changeDateTime}
              onNext={() => goTo(2)}
              onBack={() => goTo(0)}
              focusOnMount={navigated}
            />
          )}
          {step === 2 && (
            <CustomerStep
              values={draft.customer}
              errors={customerErrors}
              onChange={(customer) => setDraft((current) => ({ ...current, customer }))}
              onErrors={setCustomerErrors}
              onNext={() => goTo(3)}
              onBack={() => goTo(1)}
              focusOnMount={navigated}
            />
          )}
          {step === 3 && (
            <ReviewStep
              draft={draft}
              busy={busy}
              error={reviewError}
              onEdit={goTo}
              onConfirm={confirm}
              onBack={() => goTo(2)}
              focusOnMount={navigated}
            />
          )}
        </section>

        <span className="perforation" aria-hidden="true">
          <span />
        </span>
        <BookingStub draft={draft} />
      </div>
    </div>
  );
}
