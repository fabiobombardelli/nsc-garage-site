import { useRef, type FormEvent } from "react";
import { href } from "@/app/router";
import { Field, FieldError, RequiredNote } from "@/components/forms/Field";
import { backendMode } from "../..";
import {
  FIELD_LIMITS,
  formatPhone,
  isValidPhone,
  normalizePhone,
  validateCustomer,
  type CustomerErrors,
  type CustomerField,
  type CustomerFormValues,
} from "../../domain/validation";
import { StepHeading, StepNav } from "./StepParts";

type CustomerStepProps = {
  values: CustomerFormValues;
  errors: CustomerErrors;
  onChange: (values: CustomerFormValues) => void;
  onErrors: (errors: CustomerErrors) => void;
  onNext: () => void;
  onBack: () => void;
  focusOnMount: boolean;
};

/** Ordem dos campos na tela: o foco vai para o primeiro com erro. */
const FIELD_ORDER: CustomerField[] = [
  "name",
  "phone",
  "email",
  "vehicleModel",
  "vehicleYear",
  "notes",
  "consent",
];

const ids: Record<CustomerField, string> = {
  name: "ag-nome",
  phone: "ag-telefone",
  email: "ag-email",
  vehicleModel: "ag-carro",
  vehicleYear: "ag-ano",
  notes: "ag-observacoes",
  consent: "ag-consentimento",
};

/**
 * Etapa 3: identificação do cliente e do carro (RF-015), com autorização
 * de uso dos dados (LGPD, RNF-05).
 *
 * Os campos usam `autocomplete` (nome, telefone, e-mail), para o navegador
 * preencher sozinho (WCAG 1.3.5), e o teclado certo no celular. O telefone
 * aceita qualquer formato e é arrumado ao sair do campo.
 */
export function CustomerStep({
  values,
  errors,
  onChange,
  onErrors,
  onNext,
  onBack,
  focusOnMount,
}: CustomerStepProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends CustomerField>(field: K, value: CustomerFormValues[K]) => {
    onChange({ ...values, [field]: value });
    if (errors[field]) onErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateCustomer(values, new Date());
    onErrors(found);
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#${ids[first]}`)?.focus();
      return;
    }
    onNext();
  };

  return (
    <form ref={formRef} className="booking-form" noValidate onSubmit={handleSubmit}>
      <StepHeading step={2} focusOnMount={focusOnMount}>
        Seus dados e o carro
      </StepHeading>
      <p className="step-help">A oficina usa o telefone para confirmar o horário pelo WhatsApp.</p>
      <RequiredNote />

      <div className="form-grid">
        <Field id={ids.name} label="Nome" required error={errors.name}>
          {(control) => (
            <input
              {...control}
              type="text"
              autoComplete="name"
              maxLength={FIELD_LIMITS.name}
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
            />
          )}
        </Field>

        <Field
          id={ids.phone}
          label="Telefone com DDD"
          hint="Celular ou fixo, como (11) 98765-4321"
          required
          error={errors.phone}
        >
          {(control) => (
            <input
              {...control}
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={values.phone}
              onChange={(event) => set("phone", event.target.value)}
              onBlur={() => {
                const digits = normalizePhone(values.phone);
                if (isValidPhone(digits)) set("phone", formatPhone(digits));
              }}
            />
          )}
        </Field>

        <Field id={ids.email} label="E-mail" hint="Opcional" error={errors.email}>
          {(control) => (
            <input
              {...control}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={FIELD_LIMITS.email}
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
            />
          )}
        </Field>

        <Field
          id={ids.vehicleModel}
          label="Carro"
          hint="Marca e modelo, como Nissan 350Z"
          required
          error={errors.vehicleModel}
        >
          {(control) => (
            <input
              {...control}
              type="text"
              maxLength={FIELD_LIMITS.vehicleModel}
              value={values.vehicleModel}
              onChange={(event) => set("vehicleModel", event.target.value)}
            />
          )}
        </Field>

        <Field
          id={ids.vehicleYear}
          label="Ano"
          hint="Opcional, quatro dígitos"
          error={errors.vehicleYear}
        >
          {(control) => (
            <input
              {...control}
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={values.vehicleYear}
              onChange={(event) => set("vehicleYear", event.target.value.replace(/\D/g, ""))}
            />
          )}
        </Field>

        <div className="form-grid-wide">
          <Field
            id={ids.notes}
            label="O que o carro precisa?"
            hint="Opcional: barulhos, sintomas, o que você quer fazer"
            error={errors.notes}
          >
            {(control) => (
              <textarea
                {...control}
                rows={3}
                maxLength={FIELD_LIMITS.notes}
                value={values.notes}
                onChange={(event) => set("notes", event.target.value)}
              />
            )}
          </Field>
        </div>

        <div
          className="form-grid-wide field field-check"
          data-invalid={errors.consent ? true : undefined}
        >
          <div className="check-row">
            <input
              id={ids.consent}
              type="checkbox"
              checked={values.consent}
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={`${ids.consent}-dica${errors.consent ? ` ${ids.consent}-erro` : ""}`}
              onChange={(event) => set("consent", event.target.checked)}
            />
            <label htmlFor={ids.consent}>
              Autorizo a NSC Garage a usar meus dados só para este atendimento.
              <span aria-hidden="true"> *</span>
            </label>
          </div>
          <p id={`${ids.consent}-dica`} className="field-hint">
            Nome, telefone, e-mail e carro servem só para confirmar e registrar o atendimento.{" "}
            {backendMode === "supabase" ? (
              <>
                Eles ficam na agenda da oficina, com acesso restrito à equipe.{" "}
                <a className="text-link" href={href("privacidade")} target="_blank" rel="noopener">
                  Política de privacidade
                  <span className="sr-only-text"> (abre em nova aba)</span>
                </a>
                .
              </>
            ) : (
              "Nesta versão de demonstração, eles ficam guardados só neste navegador."
            )}
          </p>
          {errors.consent && <FieldError id={`${ids.consent}-erro`}>{errors.consent}</FieldError>}
        </div>
      </div>

      <StepNav onBack={onBack} />
    </form>
  );
}
