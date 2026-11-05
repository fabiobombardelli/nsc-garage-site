import type { AppointmentStatus } from "./types";

/**
 * Máquina de estados do agendamento (RN-06).
 *
 *   Pendente ──► Confirmado ──► Concluído
 *      │              │
 *      └──────────────┴──────► Cancelado
 *
 * Concluído e Cancelado são estados finais: nenhuma transição volta atrás.
 * Isso dá a RF-019, RF-020 e RF-021 um critério objetivo de teste.
 */
export const TRANSITIONS: Readonly<Record<AppointmentStatus, readonly AppointmentStatus[]>> = {
  pendente: ["confirmado", "cancelado"],
  confirmado: ["concluido", "cancelado"],
  concluido: [],
  cancelado: [],
};

/** Nome de cada status, como aparece na tela e nos documentos. */
export const STATUS_LABEL: Readonly<Record<AppointmentStatus, string>> = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

/** Explicação curta de cada status para o cliente. */
export const STATUS_DESCRIPTION: Readonly<Record<AppointmentStatus, string>> = {
  pendente: "A oficina ainda vai confirmar o horário.",
  confirmado: "Horário confirmado pela oficina.",
  concluido: "Atendimento concluído.",
  cancelado: "Agendamento cancelado. O horário foi liberado.",
};

/** Ação da oficina que leva a cada status (usada nos botões do painel). */
export const TRANSITION_ACTION: Readonly<Record<AppointmentStatus, string>> = {
  pendente: "Voltar para pendente",
  confirmado: "Confirmar horário",
  concluido: "Marcar como concluído",
  cancelado: "Cancelar agendamento",
};

/** Ordem em que os status aparecem nos filtros e resumos. */
export const STATUS_ORDER: readonly AppointmentStatus[] = [
  "pendente",
  "confirmado",
  "concluido",
  "cancelado",
];

/** Indica se a mudança `from → to` é permitida. */
export function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

/** Indica se o status é final (sem transições possíveis). */
export function isFinal(status: AppointmentStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** Status que ocupam o horário na agenda (RN-02). Cancelado libera a vaga. */
export function occupiesSlot(status: AppointmentStatus): boolean {
  return status === "pendente" || status === "confirmado" || status === "concluido";
}
