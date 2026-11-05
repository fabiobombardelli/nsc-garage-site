import { Search } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Field, FieldError, RequiredNote } from "@/components/forms/Field";
import { schedulingService } from "../..";
import { isProtocolFormat, normalizeProtocol } from "../../domain/protocol";
import { formatPhone, isValidPhone, normalizePhone } from "../../domain/validation";

export type Credentials = { phone: string; protocol: string };

type LookupFormProps = {
  initialPhone?: string;
  initialProtocol?: string;
  onFound: (credentials: Credentials) => void;
};

type Errors = { phone?: string; protocol?: string; form?: string };

/**
 * Identificação sem conta (RF-023, decisão 3 da revisão de requisitos):
 * telefone + protocolo de um agendamento abrem o histórico daquele telefone.
 */
export function LookupForm({ initialPhone = "", initialProtocol = "", onFound }: LookupFormProps) {
  const [phone, setPhone] = useState(initialPhone ? formatPhone(initialPhone) : "");
  const [protocol, setProtocol] = useState(initialProtocol);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;

    const found: Errors = {};
    if (!isValidPhone(normalizePhone(phone)))
      found.phone = "Digite o telefone com DDD, o mesmo usado no agendamento.";
    if (!isProtocolFormat(normalizeProtocol(protocol)))
      found.protocol = "Digite o protocolo do comprovante, como NSC-K7Q4M2.";
    setErrors(found);
    if (found.phone || found.protocol) {
      formRef.current
        ?.querySelector<HTMLElement>(found.phone ? "#consulta-telefone" : "#consulta-protocolo")
        ?.focus();
      return;
    }

    setBusy(true);
    try {
      await schedulingService.lookup(phone, protocol);
      onFound({ phone: normalizePhone(phone), protocol: normalizeProtocol(protocol) });
    } catch (caught) {
      setErrors({ form: caught instanceof Error ? caught.message : "Não foi possível consultar." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form ref={formRef} className="lookup-form" noValidate onSubmit={handleSubmit}>
      <h2 className="lookup-form-title">Consultar</h2>
      <RequiredNote />

      <Field id="consulta-telefone" label="Telefone com DDD" required error={errors.phone}>
        {(control) => (
          <input
            {...control}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
        )}
      </Field>

      <Field
        id="consulta-protocolo"
        label="Protocolo"
        hint="Está no comprovante, como NSC-K7Q4M2"
        required
        error={errors.protocol}
      >
        {(control) => (
          <input
            {...control}
            type="text"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            value={protocol}
            onChange={(event) => setProtocol(event.target.value)}
          />
        )}
      </Field>

      <button type="submit" className="button" aria-disabled={busy || undefined}>
        <Search size={18} aria-hidden="true" />
        Ver agendamentos
      </button>

      <div className="lookup-form-status" role="status">
        {errors.form && <FieldError>{errors.form}</FieldError>}
      </div>
    </form>
  );
}
