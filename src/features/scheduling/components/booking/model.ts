import type { CustomerFormValues } from "../../domain/validation";

/** As quatro etapas do agendamento, na ordem (UC-12, fluxo básico). */
export const STEPS = ["Serviço", "Data e hora", "Seus dados", "Revisão"] as const;

export type StepIndex = 0 | 1 | 2 | 3;

/** O que a pessoa já escolheu. Só vira agendamento ao confirmar na revisão. */
export type BookingDraft = {
  serviceId: string | null;
  date: string | null;
  time: string | null;
  customer: CustomerFormValues;
};

export const EMPTY_CUSTOMER: CustomerFormValues = {
  name: "",
  phone: "",
  email: "",
  vehicleModel: "",
  vehicleYear: "",
  notes: "",
  consent: false,
};

/** Último telefone usado nesta aba, para preencher a consulta de agendamentos. */
export const LAST_PHONE_KEY = "nsc:ultimo-telefone";
