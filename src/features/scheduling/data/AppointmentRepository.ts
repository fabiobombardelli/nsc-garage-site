import type { Appointment } from "../domain/types";

/**
 * Contrato de armazenamento dos agendamentos (padrão Repository).
 *
 * As telas e as regras nunca falam com o armazenamento direto: falam com
 * este contrato. Hoje ele é atendido pelo `localStorage` do navegador
 * (protótipo sem servidor). Para ir para um banco de verdade, como o
 * Supabase citado no RNF-04, basta escrever outra implementação deste
 * contrato e trocar uma linha em `data/index.ts`.
 *
 * Todos os métodos devolvem Promise, como faria uma API remota: assim a
 * troca não muda nada em quem usa.
 */
export interface AppointmentRepository {
  /** Todos os agendamentos, em qualquer ordem. */
  list(): Promise<Appointment[]>;
  /** Um agendamento pelo protocolo, ou `undefined`. */
  findByProtocol(protocol: string): Promise<Appointment | undefined>;
  /** Grava um agendamento novo ou substitui o de mesmo protocolo. */
  save(appointment: Appointment): Promise<void>;
  /** Grava vários de uma vez (dados de demonstração). */
  saveMany(appointments: Appointment[]): Promise<void>;
  /** Apaga todos os agendamentos. */
  clear(): Promise<void>;
  /**
   * Avisa quando os dados mudam, inclusive em outra aba do navegador.
   * Devolve a função que cancela o aviso.
   */
  subscribe(listener: () => void): () => void;
}
