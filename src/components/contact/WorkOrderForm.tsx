import { AlertCircle, Send } from "lucide-react";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { services } from "@/content/services";
import { whatsappLink } from "@/lib/whatsapp";

type FieldName = "name" | "message";
type Errors = Partial<Record<FieldName, string>>;

const REQUIRED_MESSAGES: Record<FieldName, string> = {
  name: "Informe seu nome para a equipe saber com quem fala.",
  message: "Conte em poucas palavras o que o carro precisa.",
};

/**
 * Ordem de serviço sem servidor: valida os campos, monta a mensagem com os
 * dados preenchidos e abre a conversa no WhatsApp da oficina.
 *
 * Acessibilidade: rótulos visíveis, campos obrigatórios marcados em texto,
 * erros ligados ao campo (aria-describedby + aria-invalid) e o foco vai
 * para o primeiro campo com problema.
 */
export function WorkOrderForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sentLink, setSentLink] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "").trim();

    const nextErrors: Errors = {};
    (Object.keys(REQUIRED_MESSAGES) as FieldName[]).forEach((name) => {
      if (!field(name)) nextErrors[name] = REQUIRED_MESSAGES[name];
    });
    setErrors(nextErrors);

    const firstInvalid = Object.keys(nextErrors)[0];
    if (firstInvalid) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      setSentLink(null);
      return;
    }

    const message = [
      `Olá! Meu nome é ${field("name")}.`,
      field("car") && `Carro: ${field("car")}`,
      field("service") && `Serviço: ${field("service")}`,
      field("message"),
    ]
      .filter(Boolean)
      .join("\n");

    const link = whatsappLink(message);
    setSentLink(link);
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const clearError = (name: FieldName) =>
    setErrors((current) => (current[name] ? { ...current, [name]: undefined } : current));

  return (
    <form ref={formRef} className="work-order-form" noValidate onSubmit={handleSubmit}>
      <p className="work-order-help">
        Campos com <span aria-hidden="true">*</span>
        <span className="sr-only-text">asterisco</span> são obrigatórios.
      </p>

      <Field id="os-nome" label="Nome" required error={errors.name}>
        <input
          id="os-nome"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "os-nome-erro" : undefined}
          onInput={() => clearError("name")}
        />
      </Field>

      <Field id="os-carro" label="Carro" hint="Modelo e ano, se souber">
        <input id="os-carro" name="car" type="text" aria-describedby="os-carro-dica" />
      </Field>

      <Field id="os-servico" label="Serviço de interesse">
        <select id="os-servico" name="service" defaultValue="">
          <option value="">Ainda não sei</option>
          {services.map((service) => (
            <option key={service.id} value={service.title}>
              {service.title}
            </option>
          ))}
        </select>
      </Field>

      <Field id="os-mensagem" label="O que o carro precisa?" required error={errors.message}>
        <textarea
          id="os-mensagem"
          name="message"
          rows={4}
          required
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "os-mensagem-erro" : undefined}
          onInput={() => clearError("message")}
        />
      </Field>

      <button type="submit" className="button work-order-submit">
        Enviar pelo WhatsApp
        <Send size={18} aria-hidden="true" />
      </button>

      <p className="work-order-status" role="status">
        {sentLink && (
          <>
            Abrimos o WhatsApp em uma nova aba. Se não abriu,{" "}
            <a className="text-link" href={sentLink} target="_blank" rel="noopener noreferrer">
              continue por este link
            </a>
            .
          </>
        )}
      </p>
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
};

/** Um campo da ordem de serviço: rótulo visível, dica opcional e mensagem de erro. */
function Field({ id, label, hint, required, error, children }: FieldProps) {
  return (
    <div className="field" data-invalid={error ? true : undefined}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <span id={`${id}-dica`} className="field-hint">
          {hint}
        </span>
      )}
      {children}
      {error && (
        <p id={`${id}-erro`} className="field-error">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
