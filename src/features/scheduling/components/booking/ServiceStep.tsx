import { useRef, useState, type FormEvent } from "react";
import { FieldError } from "@/components/forms/Field";
import { services } from "@/content/services";
import { StepHeading, StepNav } from "./StepParts";

type ServiceStepProps = {
  value: string | null;
  onChange: (serviceId: string) => void;
  onNext: () => void;
  focusOnMount: boolean;
};

const ERROR_ID = "servico-erro";

/**
 * Etapa 1: o serviço (RF-013). Uma escolha só, em botões de opção nativos
 * (setas do teclado trocam a opção). Cada opção traz o grupo (pista ou rua)
 * e a descrição, as mesmas das gavetas da seção Serviços.
 */
export function ServiceStep({ value, onChange, onNext, focusOnMount }: ServiceStepProps) {
  const [error, setError] = useState<string | null>(null);
  const firstOption = useRef<HTMLInputElement>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!value) {
      setError("Escolha um serviço para continuar.");
      firstOption.current?.focus();
      return;
    }
    onNext();
  };

  return (
    <form className="booking-form" noValidate onSubmit={handleSubmit}>
      <fieldset className="choice-fieldset">
        <legend>
          <StepHeading step={0} focusOnMount={focusOnMount}>
            Qual é o serviço?
          </StepHeading>
        </legend>
        <p className="step-help">
          Escolha o que mais se aproxima. Na avaliação, a equipe confirma o que o carro precisa.
        </p>
        {error && <FieldError id={ERROR_ID}>{error}</FieldError>}

        <ul className="service-choices">
          {services.map((service, index) => (
            <li key={service.id}>
              <label className="choice choice-service">
                <input
                  ref={index === 0 ? firstOption : undefined}
                  type="radio"
                  name="servico"
                  value={service.id}
                  checked={value === service.id}
                  aria-describedby={error ? ERROR_ID : undefined}
                  onChange={() => {
                    onChange(service.id);
                    setError(null);
                  }}
                />
                <span className="choice-service-head">
                  <span className="choice-title">{service.title}</span>
                  <span className="choice-tag">{service.group}</span>
                </span>
                <span className="choice-text">{service.description}</span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <StepNav />
    </form>
  );
}
