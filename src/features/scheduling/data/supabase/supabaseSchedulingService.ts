import { schedulingRules, type SchedulingRules } from "@/content/scheduling";
import { addDays } from "../../domain/calendar";
import { isProtocolFormat, normalizeProtocol } from "../../domain/protocol";
import { dayAvailability, type SlotBooking } from "../../domain/rules";
import type { Appointment, AppointmentStatus, Day, StatusChange } from "../../domain/types";
import { isValidPhone, normalizePhone } from "../../domain/validation";
import {
  ERROR_MESSAGES,
  SchedulingError,
  assertValidBooking,
  sortForCustomer,
  type SchedulingErrorCode,
  type SchedulingService,
} from "../../services/contract";

/** O pedaço do cliente do Supabase que este serviço usa (facilita os testes). */
export type RpcClient = {
  rpc(
    fn: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

type Options = {
  rules?: SchedulingRules;
  now?: () => Date;
  /** De quanto em quanto tempo a agenda é atualizada sozinha (RF-014). */
  refreshMs?: number;
};

const KNOWN_CODES = Object.keys(ERROR_MESSAGES) as SchedulingErrorCode[];

/** Traduz o erro do banco (a mensagem é o código, ex.: "horario-indisponivel"). */
function toSchedulingError(error: { message: string }): SchedulingError {
  const code = KNOWN_CODES.find((known) => error.message.includes(known));
  if (code) return new SchedulingError(code);
  if (/permission denied|JWT|not authorized/i.test(error.message)) {
    return new SchedulingError("acesso-negado");
  }
  return new SchedulingError("falha-de-conexao");
}

/** O banco devolve o agendamento já no formato do site; só completa o que falta. */
function toAppointment(raw: unknown): Appointment {
  const item = raw as Appointment & { history: Array<Partial<StatusChange>> };
  return {
    ...item,
    history: (item.history ?? []).map((change) => ({
      from: change.from ?? null,
      to: change.to as AppointmentStatus,
      by: change.by ?? "cliente",
      at: change.at ?? item.createdAt,
    })),
  };
}

/**
 * Implementação "supabase" do contrato (services/contract.ts). As regras
 * que protegem os dados rodam no servidor (supabase/migrations); aqui ficam
 * a validação dos formulários e o cálculo de disponibilidade, os mesmos do
 * modo local, para a pessoa ver o erro na hora, sem esperar o servidor.
 */
export function createSupabaseSchedulingService(
  client: RpcClient,
  { rules = schedulingRules, now = () => new Date(), refreshMs = 30_000 }: Options = {},
): SchedulingService {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  async function call<T>(fn: string, args?: Record<string, unknown>): Promise<T> {
    let result: { data: unknown; error: { message: string } | null };
    try {
      result = await client.rpc(fn, args);
    } catch {
      throw new SchedulingError("falha-de-conexao");
    }
    if (result.error) throw toSchedulingError(result.error);
    return result.data as T;
  }

  /** Horários ocupados num período (sem dados pessoais). */
  async function occupied(from: string, to: string): Promise<SlotBooking[]> {
    const rows = await call<Array<{ dia: string; horario: string }>>("agenda_ocupada", {
      p_de: from,
      p_ate: to,
    });
    return (rows ?? []).map((row) => ({
      date: row.dia,
      time: row.horario.slice(0, 5),
      status: "confirmado" as const,
    }));
  }

  /** Confere telefone e protocolo antes de perguntar ao servidor. */
  function credentials(phoneInput: string, protocolInput: string) {
    const phone = normalizePhone(phoneInput);
    const protocol = normalizeProtocol(protocolInput);
    if (!isValidPhone(phone) || !isProtocolFormat(protocol)) {
      throw new SchedulingError("nao-encontrado");
    }
    return { phone, protocol };
  }

  /** Muda algo e avisa as telas abertas. */
  async function mutate(fn: string, args: Record<string, unknown>) {
    const appointment = toAppointment(await call(fn, args));
    notify();
    return appointment;
  }

  return {
    mode: "supabase",

    async getWeek(weekStart): Promise<Day[]> {
      const busy = await occupied(weekStart, addDays(weekStart, 6));
      return Array.from({ length: 7 }, (_, index) =>
        dayAvailability(addDays(weekStart, index), busy, now(), rules),
      );
    },

    async getDay(date): Promise<Day> {
      return dayAvailability(date, await occupied(date, date), now(), rules);
    },

    async book(input) {
      assertValidBooking(input, now());
      const { customer } = input;
      return mutate("agendar", {
        p_servico: input.serviceId,
        p_dia: input.date,
        p_horario: input.time,
        p_nome: customer.name.trim(),
        p_telefone: normalizePhone(customer.phone),
        p_email: customer.email.trim(),
        p_carro: customer.vehicleModel.trim(),
        p_ano: customer.vehicleYear.trim(),
        p_observacoes: customer.notes.trim(),
      });
    },

    async lookup(phoneInput, protocolInput) {
      const { phone, protocol } = credentials(phoneInput, protocolInput);
      const rows = await call<unknown[]>("meus_agendamentos", {
        p_telefone: phone,
        p_protocolo: protocol,
      });
      return sortForCustomer((rows ?? []).map(toAppointment));
    },

    async cancelByCustomer(protocolInput, phoneInput) {
      const { phone, protocol } = credentials(phoneInput, protocolInput);
      return mutate("cancelar_agendamento", { p_protocolo: protocol, p_telefone: phone });
    },

    async rate(protocolInput, phoneInput, score, comment = "") {
      const { phone, protocol } = credentials(phoneInput, protocolInput);
      return mutate("avaliar_agendamento", {
        p_protocolo: protocol,
        p_telefone: phone,
        p_nota: score,
        p_comentario: comment.trim(),
      });
    },

    async listAll() {
      const rows = await call<unknown[]>("agenda_completa");
      return (rows ?? []).map(toAppointment);
    },

    async changeStatus(protocol, to) {
      return mutate("mudar_status", { p_protocolo: protocol, p_para: to });
    },

    /**
     * Sem tempo real aberto ao público (que exporia os dados), a agenda é
     * relida a cada 30 s, ao voltar para a aba e depois de cada mudança feita aqui.
     */
    subscribe(listener) {
      listeners.add(listener);
      const timer = window.setInterval(listener, refreshMs);
      const onVisible = () => document.visibilityState === "visible" && listener();
      document.addEventListener("visibilitychange", onVisible);
      return () => {
        listeners.delete(listener);
        window.clearInterval(timer);
        document.removeEventListener("visibilitychange", onVisible);
      };
    },
  };
}
