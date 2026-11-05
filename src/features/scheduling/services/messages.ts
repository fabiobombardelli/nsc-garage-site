import { serviceTitle } from "@/content/services";
import { site } from "@/content/site";
import { formatLongDate, formatTime } from "../domain/calendar";
import type { Appointment } from "../domain/types";

/**
 * Mensagens prontas para o WhatsApp (RF-017 e RF-024). Sem servidor, o
 * site não envia nada sozinho: ele abre a conversa com o texto escrito e
 * a pessoa só aperta "enviar". O canal foi definido na decisão 4 da
 * revisão de requisitos (agendamento pelo WhatsApp).
 */

const when = (appointment: Appointment) =>
  `${formatLongDate(appointment.date)}, às ${formatTime(appointment.time)}`;

const vehicle = (appointment: Appointment) =>
  [appointment.vehicle.model, appointment.vehicle.year].filter(Boolean).join(" ");

const firstName = (appointment: Appointment) => appointment.customer.name.split(" ")[0] ?? "";

/** Do cliente para a oficina: o comprovante do agendamento. */
export function receiptMessage(appointment: Appointment): string {
  return [
    `Olá! Agendei uma avaliação pelo site da ${site.name}.`,
    `Protocolo: ${appointment.protocol}`,
    `Serviço: ${serviceTitle(appointment.serviceId)}`,
    `Quando: ${when(appointment)}`,
    `Carro: ${vehicle(appointment)}`,
    `Nome: ${appointment.customer.name}`,
  ].join("\n");
}

/** Da oficina para o cliente: aviso da situação atual do agendamento. */
export function statusMessage(appointment: Appointment): string {
  const greeting = `Olá, ${firstName(appointment)}! Aqui é da ${site.name}.`;
  const service = serviceTitle(appointment.serviceId).toLowerCase();
  const reference = `(protocolo ${appointment.protocol})`;

  switch (appointment.status) {
    case "pendente":
      return `${greeting} Recebemos seu pedido de ${service} para ${when(appointment)} ${reference}. Vamos confirmar em breve.`;
    case "confirmado":
      return `${greeting} Seu horário está confirmado: ${when(appointment)}, para ${service} ${reference}. Até lá!`;
    case "concluido":
      return `${greeting} O atendimento ${reference} foi concluído. Se puder, avalie o serviço em "Meus agendamentos", no nosso site.`;
    case "cancelado":
      return `${greeting} O agendamento de ${when(appointment)} ${reference} foi cancelado. Se quiser marcar outro horário, é só responder esta mensagem.`;
  }
}
