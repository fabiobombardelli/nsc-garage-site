import { serviceTitle } from "@/content/services";
import { formatLongDate, formatTime } from "../domain/calendar";
import type { Appointment } from "../domain/types";
import { formatPhone } from "../domain/validation";

type Fact = "servico" | "quando" | "carro" | "protocolo" | "cliente" | "telefone" | "observacoes";

const LABELS: Record<Fact, string> = {
  servico: "Serviço",
  quando: "Quando",
  carro: "Carro",
  protocolo: "Protocolo",
  cliente: "Cliente",
  telefone: "Telefone",
  observacoes: "Observações",
};

/** Texto de cada informação do agendamento. */
function factValue(appointment: Appointment, fact: Fact): string | undefined {
  switch (fact) {
    case "servico":
      return serviceTitle(appointment.serviceId);
    case "quando":
      return `${formatLongDate(appointment.date)}, às ${formatTime(appointment.time)}`;
    case "carro":
      return [appointment.vehicle.model, appointment.vehicle.year].filter(Boolean).join(" ");
    case "protocolo":
      return appointment.protocol;
    case "cliente":
      return appointment.customer.name;
    case "telefone":
      return formatPhone(appointment.customer.phone);
    case "observacoes":
      return appointment.notes;
  }
}

/**
 * Informações de um agendamento numa lista de definições (dl): cada
 * rótulo fica ligado ao seu valor para quem usa leitor de tela.
 * Informações vazias (como observações não preenchidas) não aparecem.
 */
export function AppointmentFacts({
  appointment,
  facts,
}: {
  appointment: Appointment;
  facts: readonly Fact[];
}) {
  return (
    <dl className="facts">
      {facts.map((fact) => {
        const value = factValue(appointment, fact);
        if (!value) return null;
        return (
          <div key={fact} className="facts-row" data-fact={fact}>
            <dt>{LABELS[fact]}</dt>
            <dd>{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}
