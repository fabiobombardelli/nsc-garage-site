import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Testes do banco: roda a migração do Supabase num PostgreSQL de verdade
 * (PGlite, em memória) e chama as funções como o site chamaria, nos
 * papéis do Supabase: `anon` (visitante) e `authenticated` (login).
 */
import { ADMIN, OUTRO_USUARIO, as, createTestDatabase, diaUtil, proximo } from "./testing";

let db: PGlite;

const AGENDAR = "select public.agendar($1, $2, $3, $4, $5, $6, $7, $8, $9) as a";
const pedido = (dia: string, horario: string, telefone = "11987654321") => [
  "drift",
  dia,
  horario,
  "Cliente Teste",
  telefone,
  "",
  "Nissan 350Z",
  "2006",
  "",
];

type Agendamento = {
  protocol: string;
  status: string;
  history: Array<{ from?: string; to: string; by: string }>;
  rating?: { score: number };
  customer: { email?: string };
};

async function agendar(dia: string, horario: string, telefone?: string) {
  const [linha] = await as<{ a: Agendamento }>(db, "anon", AGENDAR, pedido(dia, horario, telefone));
  return linha!.a;
}

beforeAll(async () => {
  db = await createTestDatabase();
});

describe("Segurança (RNF-04)", () => {
  it("visitante não lê as tabelas direto", async () => {
    await expect(as(db, "anon", "select * from public.agendamentos")).rejects.toThrow(
      /permission denied/,
    );
    await expect(as(db, "anon", "select * from public.oficina_admins")).rejects.toThrow(
      /permission denied/,
    );
  });

  it("horários ocupados saem sem nenhum dado pessoal", async () => {
    const dia = diaUtil(4);
    await agendar(dia, "09:00", "11900001111");
    const linhas = await as<Record<string, unknown>>(
      db,
      "anon",
      "select * from public.agenda_ocupada($1, $2)",
      [dia, dia],
    );
    expect(Object.keys(linhas[0] ?? {})).toEqual(["dia", "horario"]);
  });

  it("agenda completa só para a oficina", async () => {
    await expect(as(db, "anon", "select public.agenda_completa()")).rejects.toThrow(
      /permission denied/,
    );
    await expect(
      as(db, "authenticated", "select public.agenda_completa()", [], OUTRO_USUARIO),
    ).rejects.toThrow(/acesso-negado/);
    const [linha] = await as<{ agenda_completa: unknown[] }>(
      db,
      "authenticated",
      "select public.agenda_completa()",
      [],
      ADMIN,
    );
    expect(Array.isArray(linha?.agenda_completa)).toBe(true);
  });
});

describe("UC-12 Agendar no servidor", () => {
  it("grava pendente, com protocolo e histórico", async () => {
    const a = await agendar(diaUtil(5), "10:00");
    expect(a.protocol).toMatch(/^NSC-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
    expect(a.status).toBe("pendente");
    expect(a.history).toEqual([expect.objectContaining({ to: "pendente", by: "cliente" })]);
    expect(a.customer.email).toBeUndefined();
  });

  it("TC-014.8 / RNF-06: o segundo pedido para o mesmo horário é recusado", async () => {
    const dia = diaUtil(6);
    await agendar(dia, "11:00");
    await expect(agendar(dia, "11:00", "21987654321")).rejects.toThrow(/horario-indisponivel/);
  });

  it.each([
    ["domingo", () => proximo(0), "10:00"],
    ["antes de abrir", () => diaUtil(5), "07:00"],
    ["último horário passa do fechamento", () => diaUtil(5), "18:00"],
    ["sábado depois das 11h", () => proximo(6), "12:00"],
    ["fora da janela de 30 dias", () => diaUtil(40), "10:00"],
    ["horário quebrado", () => diaUtil(5), "10:30"],
  ])("RN-01/RN-03: recusa %s", async (_nome, dia, horario) => {
    await expect(agendar(dia(), horario)).rejects.toThrow(/horario-indisponivel/);
  });

  it("aceita o último horário do dia e do sábado", async () => {
    await expect(agendar(diaUtil(7), "17:00")).resolves.toMatchObject({ status: "pendente" });
    await expect(agendar(proximo(6), "11:00")).resolves.toMatchObject({ status: "pendente" });
  });

  it("recusa telefone inválido (validação também no servidor)", async () => {
    await expect(agendar(diaUtil(8), "09:00", "123")).rejects.toThrow(/dados-invalidos/);
  });

  it("RN-07: protocolos no formato, sem repetir", async () => {
    const linhas = await db.query<{ p: string }>(
      "select public.gerar_protocolo() as p from generate_series(1, 300)",
    );
    const protocolos = linhas.rows.map((linha) => linha.p);
    protocolos.forEach((p) => expect(p).toMatch(/^NSC-[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/));
    expect(new Set(protocolos).size).toBeGreaterThan(295);
  });
});

describe("UC-18, UC-16 e UC-19 pelo telefone + protocolo", () => {
  it("consulta só com o telefone certo", async () => {
    const a = await agendar(diaUtil(9), "14:00", "13991112222");
    await expect(
      as(db, "anon", "select public.meus_agendamentos($1, $2)", ["13990000000", a.protocol]),
    ).rejects.toThrow(/nao-encontrado/);
    const [linha] = await as<{ meus_agendamentos: Agendamento[] }>(
      db,
      "anon",
      "select public.meus_agendamentos($1, $2)",
      ["13991112222", a.protocol],
    );
    expect(linha?.meus_agendamentos.map((item) => item.protocol)).toContain(a.protocol);
  });

  it("cancela com mais de 24 h e libera o horário", async () => {
    const dia = diaUtil(10);
    const a = await agendar(dia, "15:00", "13993334444");
    const [linha] = await as<{ c: Agendamento }>(
      db,
      "anon",
      "select public.cancelar_agendamento($1, $2) as c",
      [a.protocol, "13993334444"],
    );
    expect(linha?.c.status).toBe("cancelado");
    expect(linha?.c.history.at(-1)).toMatchObject({ from: "pendente", to: "cancelado" });
    await expect(agendar(dia, "15:00")).resolves.toMatchObject({ status: "pendente" });
  });

  it("RN-04: não cancela a menos de 24 h", async () => {
    await db.exec(`
      insert into public.agendamentos
        (protocolo, servico, dia, horario, cliente_nome, cliente_telefone, carro_modelo)
      select 'NSC-PERTXZ', 'drift', (agora_oficina() + interval '5 hours')::date,
             date_trunc('hour', agora_oficina() + interval '5 hours')::time,
             'Cliente', '13995556666', 'Carro'`);
    await expect(
      as(db, "anon", "select public.cancelar_agendamento($1, $2)", ["NSC-PERTXZ", "13995556666"]),
    ).rejects.toThrow(/cancelamento-nao-permitido/);
  });

  it("UC-17 + RN-05/RN-06: só o ciclo permitido, e avaliação única depois de concluído", async () => {
    const a = await agendar(diaUtil(11), "16:00", "13997778888");
    const mudar = (para: string) =>
      as(db, "authenticated", "select public.mudar_status($1, $2) as m", [a.protocol, para], ADMIN);
    const avaliar = (nota: number) =>
      as(db, "anon", "select public.avaliar_agendamento($1, $2, $3, $4)", [
        a.protocol,
        "13997778888",
        nota,
        "Muito bom",
      ]);

    await expect(mudar("concluido")).rejects.toThrow(/transicao-invalida/);
    await expect(avaliar(5)).rejects.toThrow(/avaliacao-nao-permitida/);
    await mudar("confirmado");
    const [concluido] = await mudar("concluido");
    expect((concluido as { m: Agendamento }).m.history.map((h) => h.to)).toEqual([
      "pendente",
      "confirmado",
      "concluido",
    ]);
    await expect(mudar("cancelado")).rejects.toThrow(/transicao-invalida/);
    await expect(avaliar(6)).rejects.toThrow(/avaliacao-nao-permitida/);
    const [avaliado] = await avaliar(4);
    expect(avaliado).toBeDefined();
    await expect(avaliar(5)).rejects.toThrow(/avaliacao-nao-permitida/);
  });
});
