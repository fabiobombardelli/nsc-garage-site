import type { Appointment } from "../domain/types";
import type { AppointmentRepository } from "./AppointmentRepository";

/** Chave no localStorage. O "v1" permite migrar o formato no futuro. */
export const STORAGE_KEY = "nsc:agendamentos:v1";

/** Evento interno para avisar outras partes da mesma aba. */
const CHANGE_EVENT = "nsc:agendamentos-mudaram";

/**
 * Repositório no localStorage do navegador.
 *
 * - Se o armazenamento estiver bloqueado (navegação privada em alguns
 *   navegadores), os dados ficam só na memória durante a visita.
 * - Mudanças feitas em outra aba chegam pelo evento `storage`: duas abas
 *   abertas na agenda veem o mesmo horário ser ocupado na hora (RF-014).
 */
export function createLocalStorageRepository(storage: Storage | null = safeStorage()) {
  let memory: Appointment[] = [];

  const read = (): Appointment[] => {
    if (!storage) return memory;
    try {
      const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter(isAppointment) : [];
    } catch {
      return [];
    }
  };

  const write = (appointments: Appointment[]) => {
    memory = appointments;
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch {
      // Armazenamento cheio ou bloqueado: segue só na memória.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  const repository: AppointmentRepository = {
    async list() {
      return read();
    },
    async findByProtocol(protocol) {
      return read().find((appointment) => appointment.protocol === protocol);
    },
    async save(appointment) {
      const others = read().filter((item) => item.protocol !== appointment.protocol);
      write([...others, appointment]);
    },
    async saveMany(appointments) {
      const protocols = new Set(appointments.map((item) => item.protocol));
      write([...read().filter((item) => !protocols.has(item.protocol)), ...appointments]);
    },
    async clear() {
      write([]);
    },
    subscribe(listener) {
      const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null) listener();
      };
      window.addEventListener(CHANGE_EVENT, listener);
      window.addEventListener("storage", onStorage);
      return () => {
        window.removeEventListener(CHANGE_EVENT, listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };

  return repository;
}

/** O localStorage, ou `null` se o navegador não deixar usar. */
function safeStorage(): Storage | null {
  try {
    const storage = window.localStorage;
    const probe = "nsc:teste";
    storage.setItem(probe, probe);
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

/** Confere o mínimo do formato, para dados corrompidos não quebrarem a tela. */
function isAppointment(value: unknown): value is Appointment {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Partial<Appointment>;
  return (
    typeof item.protocol === "string" &&
    typeof item.serviceId === "string" &&
    typeof item.date === "string" &&
    typeof item.time === "string" &&
    typeof item.status === "string" &&
    typeof item.customer?.phone === "string" &&
    Array.isArray(item.history)
  );
}
