import { services } from "@/content/services";
import type { Appointment, AppointmentStatus, Day, Score } from "../domain/types";
import {
  validateCustomer,
  type CustomerErrors,
  type CustomerFormValues,
} from "../domain/validation";

/**
 * Contrato do agendamento: o que as telas podem pedir, sem saber onde os
 * dados ficam. Há duas implementações com o mesmo contrato:
 *
 *   "local"     services/schedulingService.ts   demonstração, no navegador
 *   "supabase"  data/supabase/                  banco da oficina, online
 *
 * Os casos de uso da especificação:
 *
 *   UC-12 Agendar Serviço ......... getWeek, getDay, book
 *   UC-18 Consultar Histórico ...... lookup
 *   UC-16 Cancelar Agendamento ..... cancelByCustomer   (estende UC-18)
 *   UC-19 Avaliar Atendimento ...... rate               (estende UC-18)
 *   UC-17 Gerenciar Agenda ......... listAll, changeStatus
 */
export interface SchedulingService {
  /** Onde a agenda fica: "local" (demonstração no navegador) ou "supabase" (online). */
  readonly mode: "local" | "supabase";
  /** RF-013 e RF-014: os 7 dias de uma semana, com a situação de cada horário. */
  getWeek(weekStart: string): Promise<Day[]>;
  /** RF-014: a situação de um dia, consultada de novo no momento da escolha. */
  getDay(date: string): Promise<Day>;
  /** UC-12: grava o pedido (pendente) e devolve o agendamento com protocolo. */
  book(input: BookingInput): Promise<Appointment>;
  /** UC-18: telefone + protocolo liberam os agendamentos daquele telefone. */
  lookup(phone: string, protocol: string): Promise<Appointment[]>;
  /** UC-16 (RN-04). */
  cancelByCustomer(protocol: string, phone: string): Promise<Appointment>;
  /** UC-19 (RN-05). */
  rate(protocol: string, phone: string, score: Score, comment?: string): Promise<Appointment>;
  /** UC-17: a agenda inteira (só a oficina). */
  listAll(): Promise<Appointment[]>;
  /** UC-17: confirmar, concluir ou cancelar (RN-06). */
  changeStatus(protocol: string, to: AppointmentStatus): Promise<Appointment>;
  /** Avisa quando a agenda muda. Devolve a função que cancela o aviso. */
  subscribe(listener: () => void): () => void;
  /** Só na demonstração: carrega agendamentos de exemplo. */
  loadDemoData?(): Promise<number>;
  /** Só na demonstração: apaga a agenda deste navegador. */
  clearAll?(): Promise<void>;
}

export type BookingInput = {
  serviceId: string;
  date: string;
  time: string;
  customer: CustomerFormValues;
};

export type SchedulingErrorCode =
  | "dados-invalidos"
  | "servico-invalido"
  | "horario-indisponivel"
  | "nao-encontrado"
  | "transicao-invalida"
  | "cancelamento-nao-permitido"
  | "avaliacao-nao-permitida"
  | "acesso-negado"
  | "falha-de-conexao";

/** Mensagens padrão de cada erro, para mostrar na tela. */
export const ERROR_MESSAGES: Readonly<Record<SchedulingErrorCode, string>> = {
  "dados-invalidos": "Confira os campos destacados.",
  "servico-invalido": "Escolha um dos serviços da lista.",
  "horario-indisponivel":
    "Esse horário acabou de ser ocupado ou já não está disponível. Escolha outro horário.",
  "nao-encontrado":
    "Não encontramos um agendamento com esse telefone e protocolo. Confira os dois e tente de novo.",
  "transicao-invalida": "Essa mudança de situação não é permitida para este agendamento.",
  "cancelamento-nao-permitido":
    "O cancelamento pelo site vai até 24 horas antes do horário. Fale com a oficina pelo WhatsApp.",
  "avaliacao-nao-permitida":
    "A avaliação abre depois que o atendimento é concluído, uma única vez.",
  "acesso-negado": "Entre com o acesso da oficina para ver a agenda.",
  "falha-de-conexao":
    "Não foi possível falar com a agenda da oficina. Confira a internet e tente de novo.",
};

/** Erro de regra de negócio, com uma mensagem pronta para mostrar na tela. */
export class SchedulingError extends Error {
  readonly code: SchedulingErrorCode;
  /** Erros por campo, quando o código é "dados-invalidos". */
  readonly fieldErrors?: CustomerErrors;

  constructor(
    code: SchedulingErrorCode,
    message = ERROR_MESSAGES[code],
    fieldErrors?: CustomerErrors,
  ) {
    super(message);
    this.name = "SchedulingError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

/** Confere o pedido antes de gravar (UC-20 Validar Dados). Lança SchedulingError. */
export function assertValidBooking(input: BookingInput, now: Date) {
  if (!services.some((service) => service.id === input.serviceId)) {
    throw new SchedulingError("servico-invalido");
  }
  const fieldErrors = validateCustomer(input.customer, now);
  if (Object.keys(fieldErrors).length > 0) {
    throw new SchedulingError("dados-invalidos", ERROR_MESSAGES["dados-invalidos"], fieldErrors);
  }
}

/** Ordem para o cliente: os próximos atendimentos primeiro, depois o histórico (mais recente antes). */
export function sortForCustomer(appointments: Appointment[]): Appointment[] {
  const key = (item: Appointment) => `${item.date} ${item.time}`;
  const active = (item: Appointment) => item.status === "pendente" || item.status === "confirmado";
  return [...appointments].sort((a, b) => {
    if (active(a) !== active(b)) return active(a) ? -1 : 1;
    return active(a) ? key(a).localeCompare(key(b)) : key(b).localeCompare(key(a));
  });
}
