import { Ban, CalendarCheck, Clock, Flag, type LucideIcon } from "lucide-react";
import { STATUS_LABEL } from "../domain/status";
import type { AppointmentStatus } from "../domain/types";

const ICONS: Record<AppointmentStatus, LucideIcon> = {
  pendente: Clock,
  confirmado: CalendarCheck,
  concluido: Flag,
  cancelado: Ban,
};

/**
 * Situação do agendamento: ícone + texto, nunca só a cor (WCAG 1.4.1),
 * para funcionar também para daltônicos e no alto contraste.
 */
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const Icon = ICONS[status];
  return (
    <span className="status-badge" data-status={status}>
      <Icon size={16} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}
