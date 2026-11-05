import { readFileSync } from "node:fs";
import { PGlite, type Transaction } from "@electric-sql/pglite";

/**
 * Banco de testes: um PostgreSQL de verdade em memória (PGlite) com a
 * migração do Supabase aplicada e o mínimo do Supabase que falta num
 * Postgres puro (papéis anon/authenticated e auth.uid()).
 */
const MIGRATION = readFileSync(
  new URL("./migrations/20261105000000_agenda.sql", import.meta.url),
  "utf8",
);

export const ADMIN = "11111111-1111-1111-1111-111111111111";
export const OUTRO_USUARIO = "22222222-2222-2222-2222-222222222222";

const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  grant usage on schema public to anon, authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`;

export async function createTestDatabase(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  await db.exec(MIGRATION);
  await db.exec(MIGRATION); // a migração pode rodar de novo sem erro
  await db.query("insert into auth.users (id, email) values ($1, 'oficina@nsc'), ($2, 'outro@x')", [
    ADMIN,
    OUTRO_USUARIO,
  ]);
  await db.query("insert into public.oficina_admins (user_id) values ($1)", [ADMIN]);
  return db;
}

export type Role = "anon" | "authenticated";

/** Roda uma consulta num papel do Supabase (e, logado, como um usuário). */
export async function as<T>(
  db: PGlite,
  role: Role,
  sql: string,
  params: unknown[] = [],
  user?: string,
): Promise<T[]> {
  return db.transaction(async (tx: Transaction) => {
    await tx.exec(`set local role ${role}`);
    if (user) await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [user]);
    const result = await tx.query<T>(sql, params);
    return result.rows;
  });
}

/** Um dia útil daqui a `dias` dias (pula o fim de semana), "AAAA-MM-DD". */
export function diaUtil(dias: number): string {
  const data = new Date();
  data.setUTCDate(data.getUTCDate() + dias);
  while ([0, 6].includes(data.getUTCDay())) data.setUTCDate(data.getUTCDate() + 1);
  return data.toISOString().slice(0, 10);
}

/** Um dia da semana (0 = domingo … 6 = sábado), entre 3 e 9 dias à frente. */
export function proximo(diaDaSemana: number): string {
  const data = new Date();
  data.setUTCDate(data.getUTCDate() + 3);
  while (data.getUTCDay() !== diaDaSemana) data.setUTCDate(data.getUTCDate() + 1);
  return data.toISOString().slice(0, 10);
}

/**
 * Um "cliente do Supabase" que chama as funções no PGlite do jeito do
 * PostgREST: argumentos nomeados, tabela vira lista de linhas e jsonb vira
 * o próprio valor; erro vira `{ error: { message } }`.
 */
export function pgliteRpcClient(db: PGlite, role: Role, user?: string) {
  return {
    async rpc(fn: string, args: Record<string, unknown> = {}) {
      const keys = Object.keys(args);
      const named = keys.map((key, index) => `${key} => $${index + 1}`).join(", ");
      const values = keys.map((key) => args[key]);
      try {
        if (fn === "agenda_ocupada") {
          const rows = await as(
            db,
            role,
            `select dia::text as dia, horario::text as horario from public.${fn}(${named})`,
            values,
            user,
          );
          return { data: rows, error: null };
        }
        const rows = await as<{ r: unknown }>(
          db,
          role,
          `select public.${fn}(${named}) as r`,
          values,
          user,
        );
        return { data: rows[0]?.r ?? null, error: null };
      } catch (caught) {
        return { data: null, error: { message: (caught as Error).message } };
      }
    },
  };
}
