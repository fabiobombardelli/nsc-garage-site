/**
 * Modelo de domínio do agendamento: as palavras do glossário do projeto
 * (Agendamento, Protocolo, Serviço, Horário, Status, Veículo, Cliente)
 * escritas como tipos. Nenhum arquivo deste domínio conhece React, o
 * navegador ou o armazenamento: são regras puras, fáceis de testar.
 */

/** Ciclo de vida do agendamento (RN-06). Concluído e Cancelado são finais. */
export type AppointmentStatus = "pendente" | "confirmado" | "concluido" | "cancelado";

/** Quem fez uma mudança de status: o próprio cliente ou a oficina. */
export type Actor = "cliente" | "oficina";

/** Veículo (definido uma única vez, como pede a revisão de requisitos). */
export type Vehicle = {
  /** Marca e modelo, como o cliente escreveu. Ex.: "Nissan 350Z". */
  model: string;
  /** Ano com quatro dígitos. Opcional. */
  year?: string;
};

/** Identificação do cliente (RF-015). Sem conta: telefone + protocolo bastam. */
export type Customer = {
  name: string;
  /** Só números, com DDD. Ex.: "11987654321". */
  phone: string;
  email?: string;
};

/** Nota de 1 a 5 (RN-05). */
export type Score = 1 | 2 | 3 | 4 | 5;

/** Avaliação de um serviço concluído (RF-021). */
export type Rating = {
  score: Score;
  comment?: string;
  /** Data e hora da avaliação, em ISO 8601. */
  ratedAt: string;
};

/** Registro de cada mudança de status: a trilha que a oficina consulta. */
export type StatusChange = {
  from: AppointmentStatus | null;
  to: AppointmentStatus;
  by: Actor;
  /** Data e hora da mudança, em ISO 8601. */
  at: string;
};

/** Um agendamento. */
export type Appointment = {
  /** Protocolo único exibido no comprovante (RN-07). */
  protocol: string;
  /** Identificador do serviço em `content/services.ts`. */
  serviceId: string;
  /** Dia do atendimento no fuso da oficina, "AAAA-MM-DD". */
  date: string;
  /** Início do horário, "HH:MM". */
  time: string;
  customer: Customer;
  vehicle: Vehicle;
  /** Observações do cliente sobre o carro. */
  notes?: string;
  status: AppointmentStatus;
  history: StatusChange[];
  rating?: Rating;
  /** Datas de criação e da última alteração, em ISO 8601. */
  createdAt: string;
  updatedAt: string;
};

/** Situação de um horário na agenda, do ponto de vista de quem agenda. */
export type SlotState =
  /** Pode ser escolhido. */
  | "livre"
  /** Já tem agendamento na capacidade máxima (RN-02). */
  | "ocupado"
  /** Já passou ou está em cima da hora (RN-03). */
  | "encerrado";

export type Slot = { time: string; state: SlotState };

/** Situação de um dia inteiro na agenda. */
export type DayState =
  /** Tem pelo menos um horário livre. */
  | "aberto"
  /** A oficina não abre neste dia da semana (RN-01). */
  | "fechado"
  /** Todos os horários estão ocupados. */
  | "lotado"
  /** Dia passado, sem horários a tempo ou fora da janela da agenda (RN-03). */
  | "indisponivel";

export type Day = { date: string; state: DayState; slots: Slot[] };
