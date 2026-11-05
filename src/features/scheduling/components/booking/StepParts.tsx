import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { STEPS, type StepIndex } from "./model";

type StepHeadingProps = {
  step: StepIndex;
  /** Leva o foco ao título quando a etapa aparece (depois que a pessoa navegou). */
  focusOnMount: boolean;
  children: ReactNode;
};

/**
 * Título da etapa. Recebe o foco quando a etapa muda, e o leitor de tela
 * anuncia "Etapa 2 de 4" antes da pergunta (WCAG 2.4.3 e 2.4.6).
 */
export function StepHeading({ step, focusOnMount, children }: StepHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusOnMount) ref.current?.focus();
  }, [focusOnMount]);

  return (
    <h2 ref={ref} id="etapa-titulo" className="step-title" tabIndex={-1}>
      <span className="sr-only-text">
        Etapa {step + 1} de {STEPS.length}:{" "}
      </span>
      {children}
    </h2>
  );
}

type StepNavProps = {
  onBack?: () => void;
  nextLabel?: string;
  busy?: boolean;
};

/** Botões do rodapé da etapa: voltar (secundário) e avançar (ação principal). */
export function StepNav({ onBack, nextLabel = "Continuar", busy = false }: StepNavProps) {
  return (
    <div className="step-nav">
      {onBack && (
        <button type="button" className="button button-outline" onClick={onBack}>
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar
        </button>
      )}
      {/* Sem "disabled": um botão desativado perderia o foco do teclado no meio do envio. */}
      <button type="submit" className="button step-nav-next" aria-disabled={busy || undefined}>
        {busy ? "Confirmando…" : nextLabel}
        <ArrowRight className="button-arrow" size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
