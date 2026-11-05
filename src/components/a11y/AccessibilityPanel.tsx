import { Accessibility, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { href } from "@/app/router";
import { useAccessibilityPreferences } from "@/hooks/useAccessibilityPreferences";
import { FONT_SCALES, setAccessibilityPreferences } from "@/lib/accessibility";

const FONT_LABEL: Record<(typeof FONT_SCALES)[number], string> = {
  1: "100%",
  1.125: "112%",
  1.25: "125%",
  1.5: "150%",
};

type AccessibilityPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Painel de acessibilidade do topo (padrão "disclosure" do WAI-ARIA): um
 * botão com `aria-expanded` mostra e esconde o painel logo depois dele.
 * Não é janela modal: o resto da página continua acessível.
 *
 * Cada ajuste vale na hora, fica salvo no navegador e é anunciado para
 * leitores de tela. Esc ou "Fechar" escondem o painel e devolvem o foco ao
 * botão. A lógica está em `lib/accessibility.ts`; o CSS só troca tokens.
 */
export function AccessibilityPanel({ open, onOpenChange }: AccessibilityPanelProps) {
  const preferences = useAccessibilityPreferences();
  const [message, setMessage] = useState("");
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Esc fecha; clicar fora também.
  useEffect(() => {
    if (!open) return;
    const close = (returnFocus: boolean) => {
      onOpenChange(false);
      if (returnFocus) toggleRef.current?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) close(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onOpenChange]);

  return (
    <div className="a11y-control">
      <button
        ref={toggleRef}
        type="button"
        className="a11y-toggle"
        aria-expanded={open}
        aria-controls="painel-acessibilidade"
        aria-label="Acessibilidade"
        onClick={() => onOpenChange(!open)}
      >
        <Accessibility size={22} aria-hidden="true" />
        {/* O nome vem do aria-label; o texto só aparece em telas largas e diz o mesmo. */}
        <span className="a11y-toggle-text" aria-hidden="true">
          Acessibilidade
        </span>
      </button>

      <div
        ref={panelRef}
        id="painel-acessibilidade"
        className="a11y-panel"
        hidden={!open}
        aria-labelledby="painel-acessibilidade-titulo"
        role="region"
      >
        <div className="a11y-panel-head">
          <h2 id="painel-acessibilidade-titulo" className="a11y-panel-title">
            Acessibilidade
          </h2>
          <button
            type="button"
            className="icon-button a11y-panel-close"
            aria-label="Fechar painel de acessibilidade"
            onClick={() => {
              onOpenChange(false);
              toggleRef.current?.focus();
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <fieldset className="a11y-fieldset">
          <legend className="choice-legend">Tamanho do texto</legend>
          <div className="a11y-font-options">
            {FONT_SCALES.map((scale) => (
              <label key={scale} className="a11y-font-option">
                <input
                  type="radio"
                  name="tamanho-texto"
                  checked={preferences.fontScale === scale}
                  onChange={() => {
                    setAccessibilityPreferences({ fontScale: scale });
                    setMessage(`Texto em ${FONT_LABEL[scale]}.`);
                  }}
                />
                <span
                  className="a11y-font-sample"
                  aria-hidden="true"
                  style={{ fontSize: `${scale}em` }}
                >
                  A
                </span>
                <span>{FONT_LABEL[scale]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="a11y-switches">
          <label className="a11y-switch">
            <span>Alto contraste</span>
            <input
              type="checkbox"
              role="switch"
              checked={preferences.highContrast}
              onChange={(event) => {
                setAccessibilityPreferences({ contrast: event.target.checked ? "high" : "normal" });
                setMessage(
                  event.target.checked ? "Alto contraste ligado." : "Alto contraste desligado.",
                );
              }}
            />
          </label>
          <label className="a11y-switch">
            <span>Reduzir movimento</span>
            <input
              type="checkbox"
              role="switch"
              checked={preferences.reduceMotion}
              onChange={(event) => {
                setAccessibilityPreferences({ motion: event.target.checked ? "reduce" : "full" });
                setMessage(
                  event.target.checked
                    ? "Movimento reduzido ligado."
                    : "Movimento reduzido desligado.",
                );
              }}
            />
          </label>
        </div>

        <div className="a11y-panel-foot">
          <button
            type="button"
            className="button button-small button-outline"
            onClick={() => {
              setAccessibilityPreferences({ motion: "system", contrast: "system", fontScale: 1 });
              setMessage("Ajustes restaurados. O site volta a seguir o seu sistema.");
            }}
          >
            Restaurar padrão
          </button>
          <a
            className="text-link"
            href={href("acessibilidade")}
            onClick={() => onOpenChange(false)}
          >
            Atalhos e declaração de acessibilidade
          </a>
        </div>

        <p className="sr-only-text" role="status">
          {message}
        </p>
      </div>
    </div>
  );
}
