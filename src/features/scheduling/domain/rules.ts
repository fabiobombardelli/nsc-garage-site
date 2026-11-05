import type { SchedulingRules } from "@/content/scheduling";
import { addDays, fromMinutes, hoursUntil, toDateKey, toMinutes, weekday } from "./calendar";
import { occupiesSlot } from "./status";
import type { Appointment, Day, Slot, SlotState } from "./types";

/**
 * Regras de negócio da agenda (RN-01 a RN-05), escritas como funções puras.
 * O "agora" sempre chega por parâmetro: assim os testes conseguem simular
 * qualquer dia e hora, inclusive os valores-limite.
 */

/**
 * O mínimo que a agenda precisa saber de cada agendamento para calcular a
 * disponibilidade: dia, horário e situação. É o que o servidor publica
 * (sem dados pessoais) e o que um agendamento completo também tem.
 */
export type SlotBooking = Pick<Appointment, "date" | "time" | "status">;

/** Resultado de uma regra que pode recusar uma ação, com o motivo em texto. */
export type RuleResult = { allowed: true } | { allowed: false; reason: string };

/** RN-01: horários do dia, do horário de abertura até o último que termina antes de fechar. */
export function slotsForDay(dateKey: string, rules: SchedulingRules): string[] {
  const hours = rules.openingHours[weekday(dateKey)];
  if (!hours) return [];

  const times: string[] = [];
  const close = toMinutes(hours.close);
  for (let start = toMinutes(hours.open); start + rules.slotMinutes <= close;) {
    times.push(fromMinutes(start));
    start += rules.slotMinutes;
  }
  return times;
}

/** RN-03: o dia está dentro da janela da agenda (de hoje até N dias à frente)? */
export function isWithinBookingWindow(dateKey: string, now: Date, rules: SchedulingRules) {
  const today = toDateKey(now);
  return dateKey >= today && dateKey <= addDays(today, rules.bookingWindowDays);
}

/** Quantos agendamentos ocupam um horário (cancelados não contam). */
function bookingsAt(dateKey: string, time: string, appointments: readonly SlotBooking[]) {
  return appointments.filter(
    (appointment) =>
      appointment.date === dateKey && appointment.time === time && occupiesSlot(appointment.status),
  ).length;
}

/**
 * RN-02 e RN-03: situação de um horário.
 * - "encerrado": já passou, está a menos de `minLeadHours` ou fora da janela;
 * - "ocupado": atingiu a capacidade do horário;
 * - "livre": pode ser agendado.
 */
export function slotState(
  dateKey: string,
  time: string,
  appointments: readonly SlotBooking[],
  now: Date,
  rules: SchedulingRules,
): SlotState {
  if (!isWithinBookingWindow(dateKey, now, rules)) return "encerrado";
  if (hoursUntil(dateKey, time, now) < rules.minLeadHours) return "encerrado";
  if (bookingsAt(dateKey, time, appointments) >= rules.capacityPerSlot) return "ocupado";
  return "livre";
}

/** RN-01 a RN-03: situação de um dia inteiro, com cada um dos seus horários. */
export function dayAvailability(
  dateKey: string,
  appointments: readonly SlotBooking[],
  now: Date,
  rules: SchedulingRules,
): Day {
  const times = slotsForDay(dateKey, rules);
  if (times.length === 0) return { date: dateKey, state: "fechado", slots: [] };

  const slots: Slot[] = times.map((time) => ({
    time,
    state: slotState(dateKey, time, appointments, now, rules),
  }));

  // "ocupado" só acontece em horários ainda a tempo: se não sobrou nenhum livre, o dia lotou.
  const state = slots.some((slot) => slot.state === "livre")
    ? "aberto"
    : slots.some((slot) => slot.state === "ocupado")
      ? "lotado"
      : "indisponivel";
  return { date: dateKey, state, slots };
}

/** RN-04: o cliente pode cancelar pelo site até `customerCancelHours` antes do horário. */
export function canCustomerCancel(
  appointment: Appointment,
  now: Date,
  rules: SchedulingRules,
): RuleResult {
  if (appointment.status !== "pendente" && appointment.status !== "confirmado") {
    return {
      allowed: false,
      reason: "Só agendamentos pendentes ou confirmados podem ser cancelados.",
    };
  }
  if (hoursUntil(appointment.date, appointment.time, now) < rules.customerCancelHours) {
    return {
      allowed: false,
      reason: `O cancelamento pelo site vai até ${rules.customerCancelHours} horas antes do horário. Fale com a oficina pelo WhatsApp.`,
    };
  }
  return { allowed: true };
}

/** RN-05: só agendamento concluído pode ser avaliado, e uma única vez. */
export function canRate(appointment: Appointment): RuleResult {
  if (appointment.status !== "concluido") {
    return { allowed: false, reason: "A avaliação abre depois que o atendimento é concluído." };
  }
  if (appointment.rating) {
    return { allowed: false, reason: "Este atendimento já foi avaliado." };
  }
  return { allowed: true };
}
