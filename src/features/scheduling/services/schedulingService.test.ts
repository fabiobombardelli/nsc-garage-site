import { describe, expect, it } from "vitest";
import { createMemoryRepository } from "../data/memoryRepository";
import type { CustomerFormValues } from "../domain/validation";
import { SchedulingError, createSchedulingService, type BookingInput } from "./schedulingService";

/**
 * Testes dos casos de uso, do jeito que as telas os chamam, com um
 * repositório em memória e um relógio fixo.
 */
const NOW = new Date(2026, 10, 9, 10, 0); // segunda, 9/11/2026, 10h

const customer: CustomerFormValues = {
  name: "Fábio",
  phone: "(11) 98765-4321",
  email: "",
  vehicleModel: "Nissan 350Z",
  vehicleYear: "2006",
  notes: "",
  consent: true,
};

const booking: BookingInput = { serviceId: "drift", date: "2026-11-11", time: "09:00", customer };

function setup(now = NOW) {
  const clock = { now };
  const service = createSchedulingService(createMemoryRepository(), { now: () => clock.now });
  return { service, clock };
}

async function expectError(promise: Promise<unknown>, code: SchedulingError["code"]) {
  await expect(promise).rejects.toBeInstanceOf(SchedulingError);
  await expect(promise).rejects.toMatchObject({ code });
}

describe("UC-12 Agendar Serviço", () => {
  it("grava como pendente, com protocolo e telefone só com números (RF-016, RN-07)", async () => {
    const { service } = setup();
    const created = await service.book(booking);
    expect(created.status).toBe("pendente");
    expect(created.protocol).toMatch(/^NSC-[A-Z2-9]{6}$/);
    expect(created.customer.phone).toBe("11987654321");
    expect(created.history).toEqual([
      { from: null, to: "pendente", by: "cliente", at: NOW.toISOString() },
    ]);
  });

  it("TC-014.8 / RNF-06: o segundo pedido para o mesmo horário é recusado ao gravar", async () => {
    const { service } = setup();
    await service.book(booking);
    await expectError(
      service.book({ ...booking, customer: { ...customer, phone: "21987654321" } }),
      "horario-indisponivel",
    );
  });

  it("recusa dados inválidos e devolve o erro de cada campo (UC-20)", async () => {
    const { service } = setup();
    const promise = service.book({ ...booking, customer: { ...customer, phone: "123" } });
    await expectError(promise, "dados-invalidos");
    await promise.catch((error: SchedulingError) => expect(error.fieldErrors?.phone).toBeDefined());
  });

  it("recusa serviço que não está na lista (lista fixa, decisão 5)", async () => {
    const { service } = setup();
    await expectError(service.book({ ...booking, serviceId: "pintura" }), "servico-invalido");
  });

  it("a semana mostra o horário recém-agendado como ocupado (RF-014)", async () => {
    const { service } = setup();
    await service.book(booking);
    const week = await service.getWeek("2026-11-09");
    const wednesday = week.find((day) => day.date === "2026-11-11");
    expect(wednesday?.slots.find((slot) => slot.time === "09:00")?.state).toBe("ocupado");
  });
});

describe("UC-18 Consultar Histórico (telefone + protocolo)", () => {
  it("encontra os agendamentos do telefone, com o protocolo digitado de qualquer jeito", async () => {
    const { service } = setup();
    const created = await service.book(booking);
    const found = await service.lookup("11 98765 4321", created.protocol.toLowerCase());
    expect(found.map((item) => item.protocol)).toEqual([created.protocol]);
  });

  it("telefone errado dá a mesma mensagem de protocolo inexistente (não revela dados)", async () => {
    const { service } = setup();
    const created = await service.book(booking);
    const wrongPhone = service.lookup("21999999999", created.protocol);
    const wrongProtocol = service.lookup(customer.phone, "NSC-ZZZZZZ");
    await expectError(wrongPhone, "nao-encontrado");
    await expectError(wrongProtocol, "nao-encontrado");
    const [a, b] = await Promise.allSettled([wrongPhone, wrongProtocol]);
    expect(a.status === "rejected" && b.status === "rejected" && a.reason.message).toBe(
      b.status === "rejected" && b.reason.message,
    );
  });
});

describe("UC-16 Cancelar e UC-19 Avaliar", () => {
  it("cancela dentro do prazo e libera o horário", async () => {
    const { service } = setup();
    const created = await service.book(booking);
    const cancelled = await service.cancelByCustomer(created.protocol, customer.phone);
    expect(cancelled.status).toBe("cancelado");
    expect(cancelled.history.at(-1)).toMatchObject({ from: "pendente", by: "cliente" });
    await expect(service.book(booking)).resolves.toMatchObject({ status: "pendente" });
  });

  it("recusa o cancelamento a menos de 24 h", async () => {
    const { service, clock } = setup();
    const created = await service.book(booking);
    clock.now = new Date(2026, 10, 10, 9, 30); // véspera, 9h30: faltam 23h30
    await expectError(
      service.cancelByCustomer(created.protocol, customer.phone),
      "cancelamento-nao-permitido",
    );
  });

  it("avalia só depois de concluído, uma única vez", async () => {
    const { service } = setup();
    const created = await service.book(booking);
    await expectError(service.rate(created.protocol, customer.phone, 5), "avaliacao-nao-permitida");

    await service.changeStatus(created.protocol, "confirmado");
    await service.changeStatus(created.protocol, "concluido");
    const rated = await service.rate(created.protocol, customer.phone, 4, "  Muito bom  ");
    expect(rated.rating).toMatchObject({ score: 4, comment: "Muito bom" });
    await expectError(service.rate(created.protocol, customer.phone, 5), "avaliacao-nao-permitida");
  });
});

describe("UC-17 Gerenciar Agenda", () => {
  it("TC-020 segue o ciclo de vida e recusa transições inválidas", async () => {
    const { service } = setup();
    const created = await service.book(booking);
    await expectError(service.changeStatus(created.protocol, "concluido"), "transicao-invalida");
    await service.changeStatus(created.protocol, "confirmado");
    const done = await service.changeStatus(created.protocol, "concluido");
    expect(done.history.map((change) => change.to)).toEqual([
      "pendente",
      "confirmado",
      "concluido",
    ]);
    await expectError(service.changeStatus(created.protocol, "cancelado"), "transicao-invalida");
  });

  it("os dados de demonstração respeitam as regras (sem dois carros no mesmo horário)", async () => {
    const { service } = setup();
    const count = await service.loadDemoData();
    const all = await service.listAll();
    expect(all).toHaveLength(count);
    const active = all.filter((item) => item.status !== "cancelado");
    const keys = active.map((item) => `${item.date} ${item.time}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
