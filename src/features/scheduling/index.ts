import { createLocalStorageRepository } from "./data/localStorageRepository";
import { createSchedulingService } from "./services/schedulingService";

/**
 * Ponto único de montagem do agendamento.
 *
 * Para trocar o armazenamento (por exemplo, pelo Supabase), escreva outra
 * implementação de `AppointmentRepository` e troque só a linha abaixo.
 */
const repository = createLocalStorageRepository();

export const schedulingService = createSchedulingService(repository);
