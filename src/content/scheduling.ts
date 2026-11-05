/**
 * Regras de funcionamento da agenda (regras de negócio RN-01 a RN-05).
 *
 * São os valores que a oficina pode ajustar sem mexer em código de tela.
 * TODO: valores provisórios, sugeridos na revisão de requisitos de
 * 23/10/2026. Confirmar com a oficina antes de publicar e manter o
 * horário igual ao texto de `contact.hours` em `site.ts`.
 */

/** Horário de abertura e fechamento, no formato "HH:MM". */
export type OpeningHours = { open: string; close: string };

export type SchedulingRules = {
  /** RN-01: horário de cada dia da semana (0 = domingo … 6 = sábado). `null` = fechado. */
  openingHours: Record<0 | 1 | 2 | 3 | 4 | 5 | 6, OpeningHours | null>;
  /** RN-01: duração de cada horário da agenda, em minutos. */
  slotMinutes: number;
  /** RN-02: quantos carros a oficina recebe no mesmo horário. */
  capacityPerSlot: number;
  /** RN-03: antecedência mínima para agendar, em horas. */
  minLeadHours: number;
  /** RN-03: até quantos dias à frente a agenda fica aberta. */
  bookingWindowDays: number;
  /** RN-04: o cliente cancela pelo site até esta quantidade de horas antes. */
  customerCancelHours: number;
};

export const schedulingRules: SchedulingRules = {
  openingHours: {
    0: null,
    1: { open: "08:00", close: "18:00" },
    2: { open: "08:00", close: "18:00" },
    3: { open: "08:00", close: "18:00" },
    4: { open: "08:00", close: "18:00" },
    5: { open: "08:00", close: "18:00" },
    6: { open: "08:00", close: "12:00" },
  },
  slotMinutes: 60,
  capacityPerSlot: 1,
  minLeadHours: 2,
  bookingWindowDays: 30,
  customerCancelHours: 24,
};
