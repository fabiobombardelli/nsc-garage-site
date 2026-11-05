import { useEffect, useId, useRef } from "react";

type InlineConfirmProps = {
  question: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

/**
 * Pergunta de confirmação no próprio lugar da ação, sem janela modal.
 * Usada antes de ações que não têm volta (cancelar, apagar), para evitar
 * erros (WCAG 3.3.4). O foco vai para a pergunta, que o leitor de tela lê
 * em seguida; "Não" devolve tudo como estava.
 */
export function InlineConfirm({
  question,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
}: InlineConfirmProps) {
  const questionId = useId();
  const questionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    questionRef.current?.focus();
  }, []);

  return (
    <div className="inline-confirm" role="group" aria-labelledby={questionId}>
      <p id={questionId} ref={questionRef} tabIndex={-1} className="inline-confirm-question">
        {question}
      </p>
      <div className="inline-confirm-actions">
        <button
          type="button"
          className="button button-small"
          onClick={() => !busy && onConfirm()}
          aria-disabled={busy || undefined}
        >
          {confirmLabel}
        </button>
        <button type="button" className="button button-small button-outline" onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
