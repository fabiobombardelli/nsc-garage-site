import { Star } from "lucide-react";
import { SCORE_LABEL, SCORES } from "../domain/rating";
import type { Score } from "../domain/types";

/** Nota já dada, em estrelas, com o texto "4 de 5" para todos lerem. */
export function RatingStars({ score }: { score: Score }) {
  return (
    <span className="rating-stars">
      <span className="rating-stars-icons" aria-hidden="true">
        {SCORES.map((value) => (
          <Star key={value} size={16} data-filled={value <= score} />
        ))}
      </span>
      {score} de 5 · {SCORE_LABEL[score]}
    </span>
  );
}
