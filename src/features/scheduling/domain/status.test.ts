import { describe, expect, it } from "vitest";
import { STATUS_ORDER, TRANSITIONS, canTransition, isFinal, occupiesSlot } from "./status";
import type { AppointmentStatus } from "./types";

/** TC-019 e TC-020: teste de transição de estados (RN-06). */
describe("TC-019 Ciclo de vida do agendamento (RN-06)", () => {
  const valid: Array<[AppointmentStatus, AppointmentStatus]> = [
    ["pendente", "confirmado"],
    ["pendente", "cancelado"],
    ["confirmado", "concluido"],
    ["confirmado", "cancelado"],
  ];

  it.each(valid)("TC-019.1 %s → %s é permitida", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it("TC-019.2 toda transição fora do diagrama é recusada", () => {
    for (const from of STATUS_ORDER) {
      for (const to of STATUS_ORDER) {
        const expected = valid.some(([a, b]) => a === from && b === to);
        expect(canTransition(from, to), `${from} → ${to}`).toBe(expected);
      }
    }
  });

  it("TC-019.3 pendente não pula direto para concluído", () => {
    expect(canTransition("pendente", "concluido")).toBe(false);
  });

  it("TC-019.4 concluído e cancelado são finais", () => {
    expect(isFinal("concluido")).toBe(true);
    expect(isFinal("cancelado")).toBe(true);
    expect(TRANSITIONS.concluido).toHaveLength(0);
    expect(isFinal("pendente")).toBe(false);
  });

  it("TC-019.5 só o cancelado libera o horário", () => {
    expect(occupiesSlot("cancelado")).toBe(false);
    expect(occupiesSlot("pendente")).toBe(true);
    expect(occupiesSlot("confirmado")).toBe(true);
  });
});
