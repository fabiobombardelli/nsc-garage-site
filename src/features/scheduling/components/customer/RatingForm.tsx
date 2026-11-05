import { Star } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { Field, FieldError } from "@/components/forms/Field";
import { schedulingService } from "../..";
import { SCORE_LABEL, SCORES } from "../../domain/rating";
import type { Appointment, Score } from "../../domain/types";
import { FIELD_LIMITS } from "../../domain/validation";

type RatingFormProps = {
  appointment: Appointment;
  phone: string;
  onDone: (message: string) => void;
};

/**
 * UC-19 Avaliar Atendimento (RF-021, RN-05): nota de 1 a 5 e comentário
 * opcional. As estrelas são botões de opção nativos: setas do teclado
 * mudam a nota, e cada opção tem nome falado ("4 de 5, Muito bom").
 */
export function RatingForm({ appointment, phone, onDone }: RatingFormProps) {
  const [score, setScore] = useState<Score | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const firstStar = useRef<HTMLInputElement>(null);
  const name = `nota-${appointment.protocol}`;
  const errorId = `${name}-erro`;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!score) {
      setError("Escolha uma nota de 1 a 5 estrelas.");
      firstStar.current?.focus();
      return;
    }
    setBusy(true);
    try {
      await schedulingService.rate(appointment.protocol, phone, score, comment);
      onDone(`Obrigado! Sua avaliação de ${score} de 5 foi registrada.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível enviar a avaliação.");
      setBusy(false);
    }
  };

  return (
    <form className="rating-form" noValidate onSubmit={handleSubmit}>
      <fieldset className="rating-fieldset">
        <legend className="choice-legend">Sua nota para o atendimento</legend>
        {error && <FieldError id={errorId}>{error}</FieldError>}
        <div className="rating-options">
          {SCORES.map((value) => (
            <label key={value} className="rating-option">
              <input
                ref={value === 1 ? firstStar : undefined}
                className="rating-input"
                type="radio"
                name={name}
                value={value}
                checked={score === value}
                aria-describedby={error ? errorId : undefined}
                onChange={() => {
                  setScore(value);
                  setError(null);
                }}
              />
              <Star size={28} aria-hidden="true" data-filled={score !== null && value <= score} />
              <span className="sr-only-text">
                {value} de 5, {SCORE_LABEL[value]}
              </span>
            </label>
          ))}
          <span className="rating-current" aria-hidden="true">
            {score ? `${score} de 5 · ${SCORE_LABEL[score]}` : "Escolha de 1 a 5"}
          </span>
        </div>
      </fieldset>

      <Field id={`comentario-${appointment.protocol}`} label="Comentário" hint="Opcional">
        {(control) => (
          <textarea
            {...control}
            rows={3}
            maxLength={FIELD_LIMITS.notes}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        )}
      </Field>

      <button type="submit" className="button button-small" aria-disabled={busy || undefined}>
        Enviar avaliação
      </button>
    </form>
  );
}
