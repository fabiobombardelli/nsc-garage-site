import { describe, expect, it } from "vitest";
import { schedulingRules } from "@/content/scheduling";
import { canCustomerCancel, canRate, dayAvailability, slotState, slotsForDay } from "./rules";
import type { Appointment, AppointmentStatus } from "./types";

/**
 * Testes das regras de negócio da agenda. Os nomes trazem o caso de teste
 * (TC) e a regra (RN) da matriz de rastreabilidade.
 *
 * Datas de referência (novembro de 2026):
 *   seg 9 · ter 10 · qua 11 · qui 12 · sex 13 · sáb 14 · dom 15
 */
const rules = schedulingRules;
/** "Agora": segunda-feira, 9 de novembro de 2026, 10h. */
const NOW = new Date(2026, 10, 9, 10, 0);

function appointment(overrides: Partial<Appointment> = {}): Appointment {
  return {
    protocol: "NSC-AAAAAA",
    serviceId: "drift",
    date: "2026-11-10",
    time: "09:00",
    customer: { name: "Cliente", phone: "11987654321" },
    vehicle: { model: "Nissan 350Z" },
    status: "pendente",
    history: [],
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
    ...overrides,
  };
}

describe("RN-01 Horários do dia", () => {
  it("dia útil: das 8h às 17h, de hora em hora (último termina às 18h)", () => {
    const slots = slotsForDay("2026-11-10", rules);
    expect(slots[0]).toBe("08:00");
    expect(slots.at(-1)).toBe("17:00");
    expect(slots).toHaveLength(10);
  });

  it("sábado: das 8h às 11h", () => {
    expect(slotsForDay("2026-11-14", rules)).toEqual(["08:00", "09:00", "10:00", "11:00"]);
  });

  it("domingo: fechado", () => {
    expect(slotsForDay("2026-11-15", rules)).toEqual([]);
    expect(dayAvailability("2026-11-15", [], NOW, rules).state).toBe("fechado");
  });
});

describe("TC-014 Disponibilidade (tabela de decisão: RN-02 e RN-03)", () => {
  it("TC-014.1 horário livre no futuro → livre", () => {
    expect(slotState("2026-11-10", "09:00", [], NOW, rules)).toBe("livre");
  });

  it("TC-014.2 horário com agendamento ativo → ocupado (capacidade 1)", () => {
    const taken = [appointment({ date: "2026-11-10", time: "09:00" })];
    expect(slotState("2026-11-10", "09:00", taken, NOW, rules)).toBe("ocupado");
  });

  it("TC-014.3 agendamento cancelado libera o horário", () => {
    const cancelled = [appointment({ status: "cancelado" })];
    expect(slotState("2026-11-10", "09:00", cancelled, NOW, rules)).toBe("livre");
  });

  it("TC-014.4 horário que já passou → encerrado", () => {
    expect(slotState("2026-11-09", "08:00", [], NOW, rules)).toBe("encerrado");
  });

  it("TC-014.5 antecedência mínima de 2 h (valor-limite)", () => {
    // Agora são 10h: 12h está exatamente a 2 h (aceita); 11h está a 1 h (recusa).
    expect(slotState("2026-11-09", "12:00", [], NOW, rules)).toBe("livre");
    expect(slotState("2026-11-09", "11:00", [], NOW, rules)).toBe("encerrado");
  });

  it("TC-014.6 fora da janela de 30 dias → encerrado", () => {
    expect(slotState("2026-12-09", "09:00", [], NOW, rules)).toBe("livre");
    expect(slotState("2026-12-10", "09:00", [], NOW, rules)).toBe("encerrado");
  });

  it("TC-014.7 dia com todos os horários tomados → lotado", () => {
    const full = slotsForDay("2026-11-14", rules).map((time, index) =>
      appointment({ protocol: `NSC-AAAAA${index + 2}`, date: "2026-11-14", time }),
    );
    expect(dayAvailability("2026-11-14", full, NOW, rules).state).toBe("lotado");
  });
});

describe("TC-018 Cancelamento pelo cliente (RN-04, valor-limite de 24 h)", () => {
  // Atendimento na terça, 10/11, às 10h.
  const booked = appointment({ date: "2026-11-10", time: "10:00", status: "confirmado" });

  it("TC-018.1 exatamente 24 h antes → permite", () => {
    expect(canCustomerCancel(booked, new Date(2026, 10, 9, 10, 0), rules).allowed).toBe(true);
  });

  it("TC-018.2 um minuto antes do limite (24 h e 1 min) → permite", () => {
    expect(canCustomerCancel(booked, new Date(2026, 10, 9, 9, 59), rules).allowed).toBe(true);
  });

  it("TC-018.3 um minuto depois do limite (23 h 59 min) → recusa com motivo", () => {
    const result = canCustomerCancel(booked, new Date(2026, 10, 9, 10, 1), rules);
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toMatch(/24 horas/);
  });

  it.each<AppointmentStatus>(["concluido", "cancelado"])(
    "TC-018.4 status %s não pode ser cancelado",
    (status) => {
      expect(canCustomerCancel({ ...booked, status }, NOW, rules).allowed).toBe(false);
    },
  );
});

describe("TC-021 Avaliação (RN-05)", () => {
  it("TC-021.1 concluído e sem avaliação → permite", () => {
    expect(canRate(appointment({ status: "concluido" })).allowed).toBe(true);
  });

  it.each<AppointmentStatus>(["pendente", "confirmado", "cancelado"])(
    "TC-021.2 status %s → recusa",
    (status) => {
      expect(canRate(appointment({ status })).allowed).toBe(false);
    },
  );

  it("TC-021.3 já avaliado → recusa (uma avaliação por agendamento)", () => {
    const rated = appointment({
      status: "concluido",
      rating: { score: 5, ratedAt: NOW.toISOString() },
    });
    expect(canRate(rated).allowed).toBe(false);
  });
});
