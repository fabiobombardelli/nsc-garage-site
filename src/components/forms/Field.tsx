import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

/** Atributos que o campo passa ao controle (input, select, textarea). */
export type ControlProps = {
  id: string;
  required?: boolean;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
};

type FieldProps = {
  id: string;
  label: string;
  /** Dica curta abaixo do rótulo (formato esperado, exemplo). */
  hint?: string;
  required?: boolean;
  error?: string;
  /** Recebe os atributos de acessibilidade já ligados e devolve o controle. */
  children: (control: ControlProps) => ReactNode;
};

/**
 * Um campo de formulário: rótulo visível, dica opcional e mensagem de erro.
 *
 * O campo liga tudo ao controle para quem usa leitor de tela: o rótulo
 * pelo `for`, a dica e o erro pelo `aria-describedby`, e o estado de erro
 * pelo `aria-invalid` (WCAG 1.3.1, 3.3.1 e 3.3.2). Uso:
 *
 *   <Field id="nome" label="Nome" required error={errors.name}>
 *     {(control) => <input {...control} name="name" autoComplete="name" />}
 *   </Field>
 */
export function Field({ id, label, hint, required, error, children }: FieldProps) {
  const hintId = hint ? `${id}-dica` : undefined;
  const errorId = error ? `${id}-erro` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="field" data-invalid={error ? true : undefined}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {hint && (
        <span id={hintId} className="field-hint">
          {hint}
        </span>
      )}
      {children({
        id,
        required,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy,
      })}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

/** Mensagem de erro com ícone e texto: o erro nunca é indicado só pela cor (WCAG 1.4.1). */
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="field-error">
      <AlertCircle size={16} aria-hidden="true" />
      {children}
    </p>
  );
}

/** Aviso padrão do topo dos formulários. */
export function RequiredNote() {
  return (
    <p className="form-note">
      Campos com <span aria-hidden="true">*</span>
      <span className="sr-only-text">asterisco</span> são obrigatórios.
    </p>
  );
}
