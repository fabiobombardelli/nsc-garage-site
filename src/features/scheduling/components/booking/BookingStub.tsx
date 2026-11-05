import { serviceTitle } from "@/content/services";
import { formatLongDate, formatTime } from "../../domain/calendar";
import type { BookingDraft } from "./model";

/**
 * O canhoto do cupom: o que já foi escolhido, preenchido a cada etapa.
 * É informação complementar; a etapa atual fica à esquerda, antes dele.
 */
export function BookingStub({ draft }: { draft: BookingDraft }) {
  const car = [draft.customer.vehicleModel, draft.customer.vehicleYear].filter(Boolean).join(" ");
  const rows = [
    { label: "Serviço", value: draft.serviceId && serviceTitle(draft.serviceId) },
    { label: "Dia", value: draft.date && formatLongDate(draft.date) },
    { label: "Horário", value: draft.time && formatTime(draft.time) },
    { label: "Carro", value: car },
  ];

  return (
    <aside className="booking-stub" aria-labelledby="resumo-titulo">
      <h2 id="resumo-titulo" className="booking-stub-title">
        Resumo
      </h2>
      <dl className="facts">
        {rows.map((row) => (
          <div key={row.label} className="facts-row" data-empty={!row.value || undefined}>
            <dt>{row.label}</dt>
            <dd>{row.value || "A escolher"}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
