import { schedulingRules, type SchedulingRules } from "@/content/scheduling";
import { services } from "@/content/services";
import type { AppointmentRepository } from "../data/AppointmentRepository";
import { buildDemoAppointments } from "../data/demoData";
import { addDays } from "../domain/calendar";
import { generateProtocol, isProtocolFormat, normalizeProtocol } from "../domain/protocol";
import { canCustomerCancel, canRate, dayAvailability, slotState } from "../domain/rules";
import { canTransition } from "../domain/status";
import type { Actor, Appointment, AppointmentStatus, Day, Score } from "../domain/types";
import {
  normalizePhone,
  validateCustomer,
  type CustomerErrors,
  type CustomerFormValues,
} from "../domain/validation";

/**
 * Casos de uso do agendamento (camada de aplicação). Cada método é um
 * caso de uso da especificação e junta as regras do domínio com o
 * repositório:
 *
 *   UC-12 Agendar Serviço ......... getWeek, getDay, book
 *   UC-18 Consultar Histórico ...... lookup
 *   UC-16 Cancelar Agendamento ..... cancelByCustomer   (estende UC-18)
 *   UC-19 Avaliar Atendimento ...... rate               (estende UC-18)
 *   UC-17 Gerenciar Agenda ......... listAll, changeStatus
 *
 * As telas só chamam estes métodos; nenhuma regra fica dentro de um
 * componente React.
 */

export type SchedulingErrorCode =
  | "dados-invalidos"
  | "servico-invalido"
  | "horario-indisponivel"
  | "nao-encontrado"
  | "transicao-invalida"
  | "cancelamento-nao-permitido"
  | "avaliacao-nao-permitida";

/** Erro de regra de negócio, com uma mensagem pronta para mostrar na tela. */
export class SchedulingError extends Error {
  readonly code: SchedulingErrorCode;
  /** Erros por campo, quando o código é "dados-invalidos". */
  readonly fieldErrors?: CustomerErrors;

  constructor(code: SchedulingErrorCode, message: string, fieldErrors?: CustomerErrors) {
    super(message);
    this.name = "SchedulingError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export type BookingInput = {
  serviceId: string;
  date: string;
  time: string;
  customer: CustomerFormValues;
};

type ServiceOptions = {
  rules?: SchedulingRules;
  /** Relógio do sistema. Os testes passam um relógio fixo. */
  now?: () => Date;
  /** Gerador aleatório do protocolo. */
  random?: () => number;
};

const NOT_FOUND_MESSAGE =
  "Não encontramos um agendamento com esse telefone e protocolo. Confira os dois e tente de novo.";

/** Ordem para o cliente: os próximos atendimentos primeiro, depois o histórico (mais recente antes). */
function sortForCustomer(appointments: Appointment[]): Appointment[] {
  const key = (item: Appointment) => `${item.date} ${item.time}`;
  const active = (item: Appointment) => item.status === "pendente" || item.status === "confirmado";
  return [...appointments].sort((a, b) => {
    if (active(a) !== active(b)) return active(a) ? -1 : 1;
    return active(a) ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a));
  });
}

export function createSchedulingService(
  repository: AppointmentRepository,
  { rules = schedulingRules, now = () => new Date(), random = Math.random }: ServiceOptions = {},
) {
  /** Busca por protocolo e confere o telefone (identificação sem conta, RF-023). */
  async function findOwned(protocolInput: string, phoneInput: string): Promise<Appointment> {
    const protocol = normalizeProtocol(protocolInput);
    const phone = normalizePhone(phoneInput);
    const appointment = isProtocolFormat(protocol)
      ? await repository.findByProtocol(protocol)
      : undefined;
    // A mesma mensagem nos dois casos: não revela se o protocolo existe.
    if (!appointment || appointment.customer.phone !== phone) {
      throw new SchedulingError("nao-encontrado", NOT_FOUND_MESSAGE);
    }
    return appointment;
  }

  /** Aplica uma mudança de status, registrando quem mudou e quando. */
  function withStatus(appointment: Appointment, to: AppointmentStatus, by: Actor): Appointment {
    const at = now().toISOString();
    return {
      ...appointment,
      status: to,
      updatedAt: at,
      history: [...appointment.history, { from: appointment.status, to, by, at }],
    };
  }

  return {
    /** RF-013 e RF-014: os 7 dias de uma semana, com a situação de cada horário. */
    async getWeek(weekStart: string): Promise<Day[]> {
      const appointments = await repository.list();
      return Array.from({ length: 7 }, (_, index) =>
        dayAvailability(addDays(weekStart, index), appointments, now(), rules),
      );
    },

    /** RF-014: a situação de um dia, consultada de novo no momento da escolha. */
    async getDay(date: string): Promise<Day> {
      return dayAvailability(date, await repository.list(), now(), rules);
    },

    /**
     * UC-12 Agendar Serviço (RF-012 a RF-016).
     * Valida os dados (UC-20), confere de novo se o horário continua livre
     * na hora de gravar (UC-21, RF-014) e gera o protocolo (RN-07).
     */
    async book(input: BookingInput): Promise<Appointment> {
      if (!services.some((service) => service.id === input.serviceId)) {
        throw new SchedulingError("servico-invalido", "Escolha um dos serviços da lista.");
      }

      const fieldErrors = validateCustomer(input.customer, now());
      if (Object.keys(fieldErrors).length > 0) {
        throw new SchedulingError("dados-invalidos", "Confira os campos destacados.", fieldErrors);
      }

      const appointments = await repository.list();
      if (slotState(input.date, input.time, appointments, now(), rules) !== "livre") {
        throw new SchedulingError(
          "horario-indisponivel",
          "Esse horário acabou de ser ocupado ou já não está disponível. Escolha outro horário.",
        );
      }

      const taken = new Set(appointments.map((item) => item.protocol));
      let protocol = generateProtocol(random);
      while (taken.has(protocol)) protocol = generateProtocol(random);

      const createdAt = now().toISOString();
      const email = input.customer.email.trim();
      const year = input.customer.vehicleYear.trim();
      const notes = input.customer.notes.trim();
      const appointment: Appointment = {
        protocol,
        serviceId: input.serviceId,
        date: input.date,
        time: input.time,
        customer: {
          name: input.customer.name.trim(),
          phone: normalizePhone(input.customer.phone),
          ...(email ? { email } : {}),
        },
        vehicle: {
          model: input.customer.vehicleModel.trim(),
          ...(year ? { year } : {}),
        },
        ...(notes ? { notes } : {}),
        status: "pendente",
        history: [{ from: null, to: "pendente", by: "cliente", at: createdAt }],
        createdAt,
        updatedAt: createdAt,
      };

      await repository.save(appointment);
      return appointment;
    },

    /**
     * UC-18 Consultar Histórico (RF-020, RF-023): telefone + protocolo de um
     * agendamento liberam todos os agendamentos daquele telefone.
     */
    async lookup(phoneInput: string, protocolInput: string): Promise<Appointment[]> {
      const owned = await findOwned(protocolInput, phoneInput);
      const all = await repository.list();
      return sortForCustomer(all.filter((item) => item.customer.phone === owned.customer.phone));
    },

    /** UC-16 Cancelar Agendamento (RF-018, RN-04). */
    async cancelByCustomer(protocol: string, phone: string): Promise<Appointment> {
      const appointment = await findOwned(protocol, phone);
      const rule = canCustomerCancel(appointment, now(), rules);
      if (!rule.allowed) throw new SchedulingError("cancelamento-nao-permitido", rule.reason);

      const cancelled = withStatus(appointment, "cancelado", "cliente");
      await repository.save(cancelled);
      return cancelled;
    },

    /** UC-19 Avaliar Atendimento (RF-021, RN-05). */
    async rate(protocol: string, phone: string, score: Score, comment = ""): Promise<Appointment> {
      const appointment = await findOwned(protocol, phone);
      const rule = canRate(appointment);
      if (!rule.allowed) throw new SchedulingError("avaliacao-nao-permitida", rule.reason);
      if (!Number.isInteger(score) || score < 1 || score > 5) {
        throw new SchedulingError("avaliacao-nao-permitida", "Escolha uma nota de 1 a 5.");
      }

      const ratedAt = now().toISOString();
      const text = comment.trim();
      const rated: Appointment = {
        ...appointment,
        updatedAt: ratedAt,
        rating: { score, ratedAt, ...(text ? { comment: text } : {}) },
      };
      await repository.save(rated);
      return rated;
    },

    /** UC-17 Gerenciar Agenda: listar (em ordem de data e horário). */
    async listAll(): Promise<Appointment[]> {
      const all = await repository.list();
      return all.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    },

    /** UC-17 Gerenciar Agenda: confirmar, concluir ou cancelar (RF-019, RN-06). */
    async changeStatus(protocol: string, to: AppointmentStatus): Promise<Appointment> {
      const appointment = await repository.findByProtocol(protocol);
      if (!appointment) throw new SchedulingError("nao-encontrado", "Agendamento não encontrado.");
      if (!canTransition(appointment.status, to)) {
        throw new SchedulingError(
          "transicao-invalida",
          "Essa mudança de situação não é permitida para este agendamento.",
        );
      }

      const changed = withStatus(appointment, to, "oficina");
      await repository.save(changed);
      return changed;
    },

    /** Carrega agendamentos de exemplo para demonstrar o painel. Devolve quantos criou. */
    async loadDemoData(): Promise<number> {
      const existing = await repository.list();
      const demo = buildDemoAppointments(existing, now(), rules, random);
      await repository.saveMany(demo);
      return demo.length;
    },

    /** Apaga todos os agendamentos deste navegador. */
    async clearAll(): Promise<void> {
      await repository.clear();
    },

    /** Avisa quando a agenda muda (inclusive em outra aba). */
    subscribe: repository.subscribe,
  };
}

export type SchedulingService = ReturnType<typeof createSchedulingService>;
