import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { createSupabaseSchedulingService } from "../src/features/scheduling/data/supabase/supabaseSchedulingService";
import type { CustomerFormValues } from "../src/features/scheduling/domain/validation";
import { SchedulingError } from "../src/features/scheduling/services/contract";
import { ADMIN, OUTRO_USUARIO, createTestDatabase, diaUtil, pgliteRpcClient } from "./testing";

/**
 * Integração: o mesmo serviço que o site usa online, falando com o banco
 * de verdade (PGlite) pelo formato do PostgREST. Garante que nomes de
 * parâmetros, formatos de data e hora e códigos de erro batem dos dois lados.
 */
let db: PGlite;

const customer: CustomerFormValues = {
  name: "Fábio",
  phone: "(13) 98765-4321",
  email: "fabio@exemplo.com",
  vehicleModel: "Nissan 350Z",
  vehicleYear: "2006",
  notes: "Barulho na suspensão",
  consent: true,
};

const visitante = () => createSupabaseSchedulingService(pgliteRpcClient(db, "anon"));
const oficina = () => createSupabaseSchedulingService(pgliteRpcClient(db, "authenticated", ADMIN));

beforeAll(async () => {
  db = await createTestDatabase();
});

describe("Serviço online × banco", () => {
  it("agenda, mostra o horário ocupado e recusa o mesmo horário de novo", async () => {
    const dia = diaUtil(5);
    const criado = await visitante().book({
      serviceId: "drift",
      date: dia,
      time: "10:00",
      customer,
    });
    expect(criado).toMatchObject({
      date: dia,
      time: "10:00",
      status: "pendente",
      customer: { name: "Fábio", phone: "13987654321", email: "fabio@exemplo.com" },
      vehicle: { model: "Nissan 350Z", year: "2006" },
      notes: "Barulho na suspensão",
    });
    expect(criado.history[0]).toMatchObject({ from: null, to: "pendente", by: "cliente" });

    const day = await visitante().getDay(dia);
    expect(day.slots.find((slot) => slot.time === "10:00")?.state).toBe("ocupado");

    await expect(
      visitante().book({ serviceId: "motor", date: dia, time: "10:00", customer }),
    ).rejects.toMatchObject({ code: "horario-indisponivel" });
  });

  it("valida no navegador antes de ir ao servidor", async () => {
    const erro = await visitante()
      .book({
        serviceId: "drift",
        date: diaUtil(6),
        time: "09:00",
        customer: { ...customer, phone: "1" },
      })
      .catch((caught: SchedulingError) => caught);
    expect(erro).toBeInstanceOf(SchedulingError);
    expect((erro as SchedulingError).fieldErrors?.phone).toBeDefined();
  });

  it("consulta, cancela e a oficina vê tudo; quem não é da oficina não vê", async () => {
    const criado = await visitante().book({
      serviceId: "suspensao",
      date: diaUtil(8),
      time: "14:00",
      customer,
    });
    const lista = await visitante().lookup("13 98765-4321", criado.protocol.toLowerCase());
    expect(lista.map((item) => item.protocol)).toContain(criado.protocol);

    const cancelado = await visitante().cancelByCustomer(criado.protocol, customer.phone);
    expect(cancelado.status).toBe("cancelado");

    const agenda = await oficina().listAll();
    expect(agenda.some((item) => item.protocol === criado.protocol)).toBe(true);
    await expect(
      createSupabaseSchedulingService(
        pgliteRpcClient(db, "authenticated", OUTRO_USUARIO),
      ).listAll(),
    ).rejects.toMatchObject({ code: "acesso-negado" });
    await expect(visitante().listAll()).rejects.toMatchObject({ code: "acesso-negado" });
  });

  it("ciclo da oficina e avaliação do cliente", async () => {
    const criado = await visitante().book({
      serviceId: "manutencao",
      date: diaUtil(9),
      time: "11:00",
      customer,
    });
    await expect(oficina().changeStatus(criado.protocol, "concluido")).rejects.toMatchObject({
      code: "transicao-invalida",
    });
    await oficina().changeStatus(criado.protocol, "confirmado");
    await oficina().changeStatus(criado.protocol, "concluido");
    const avaliado = await visitante().rate(criado.protocol, customer.phone, 5, "Excelente");
    expect(avaliado.rating).toMatchObject({ score: 5, comment: "Excelente" });
    await expect(visitante().rate(criado.protocol, customer.phone, 4)).rejects.toMatchObject({
      code: "avaliacao-nao-permitida",
    });
  });

  it("telefone errado dá 'não encontrado' sem revelar se o protocolo existe", async () => {
    const criado = await visitante().book({
      serviceId: "drift",
      date: diaUtil(10),
      time: "15:00",
      customer,
    });
    await expect(visitante().lookup("11999998888", criado.protocol)).rejects.toMatchObject({
      code: "nao-encontrado",
    });
  });
});
