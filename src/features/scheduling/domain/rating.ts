import type { Score } from "./types";

/** Notas possíveis da avaliação (RN-05: inteira, de 1 a 5). */
export const SCORES: readonly Score[] = [1, 2, 3, 4, 5];

/** O que cada nota quer dizer, dito junto do número para todos entenderem. */
export const SCORE_LABEL: Readonly<Record<Score, string>> = {
  1: "Ruim",
  2: "Regular",
  3: "Bom",
  4: "Muito bom",
  5: "Excelente",
};
