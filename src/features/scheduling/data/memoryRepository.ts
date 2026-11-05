import type { Appointment } from "../domain/types";
import type { AppointmentRepository } from "./AppointmentRepository";

/**
 * Repositório só em memória. Usado nos testes automáticos: cada teste
 * começa com uma agenda limpa, sem depender do navegador.
 */
export function createMemoryRepository(initial: Appointment[] = []): AppointmentRepository {
  let items = structuredClone(initial);
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  return {
    async list() {
      return structuredClone(items);
    },
    async findByProtocol(protocol) {
      const found = items.find((item) => item.protocol === protocol);
      return found && structuredClone(found);
    },
    async save(appointment) {
      items = [...items.filter((item) => item.protocol !== appointment.protocol), appointment];
      notify();
    },
    async saveMany(appointments) {
      const protocols = new Set(appointments.map((item) => item.protocol));
      items = [...items.filter((item) => !protocols.has(item.protocol)), ...appointments];
      notify();
    },
    async clear() {
      items = [];
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
