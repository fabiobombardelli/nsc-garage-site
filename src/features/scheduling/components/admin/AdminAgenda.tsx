import { useState } from "react";
import { ParkedCar } from "@/components/car/ParkedCar";
import { FieldError } from "@/components/forms/Field";
import { InlineConfirm } from "@/components/ui/InlineConfirm";
import { schedulingService } from "../..";
import { formatLongDate, formatLongDateTitle, formatTime, toDateKey } from "../../domain/calendar";
import { STATUS_LABEL, STATUS_ORDER } from "../../domain/status";
import type { Appointment, AppointmentStatus } from "../../domain/types";
import { useAgenda } from "../../hooks/useAgenda";
import { AgendaItem } from "./AgendaItem";

type Filter = AppointmentStatus | "todos";

const FILTER_LABEL: Record<Filter, string> = {
  todos: "Todos",
  pendente: "Pendentes",
  confirmado: "Confirmados",
  concluido: "Concluídos",
  cancelado: "Cancelados",
};

/**
 * Agrupa por dia: hoje e os próximos dias primeiro (em ordem), depois os
 * dias que já passaram (o mais recente antes). Dentro do dia, por horário.
 */
function groupByDay(appointments: Appointment[], today: string): Array<[string, Appointment[]]> {
  const groups = new Map<string, Appointment[]>();
  for (const appointment of appointments) {
    groups.set(appointment.date, [...(groups.get(appointment.date) ?? []), appointment]);
  }
  return [...groups.entries()].sort(([a], [b]) => {
    const aPast = a < today;
    if (aPast !== b < today) return aPast ? 1 : -1;
    return aPast ? b.localeCompare(a) : a.localeCompare(b);
  });
}

/** A frase do topo responde à pergunta da tela: o que precisa de mim e quem vem a seguir? */
function summarize(appointments: Appointment[], today: string): string {
  const pending = appointments.filter((item) => item.status === "pendente").length;
  const next = appointments.find(
    (item) => item.date >= today && (item.status === "pendente" || item.status === "confirmado"),
  );
  const pendingText =
    pending === 0
      ? "Nenhum pedido aguardando confirmação."
      : `${pending} ${pending === 1 ? "pedido aguardando" : "pedidos aguardando"} confirmação.`;
  const nextText = next
    ? ` Próximo atendimento: ${formatLongDate(next.date)}, às ${formatTime(next.time)}, com ${next.customer.name}.`
    : "";
  return pendingText + nextText;
}

/**
 * Agenda da oficina (UC-17): resumo, filtro por situação e os atendimentos
 * por dia. Atualiza sozinha quando chega um pedido novo (mesmo de outra aba).
 */
export function AdminAgenda() {
  const today = toDateKey(new Date());
  const {
    data: appointments = [],
    loading,
    error,
  } = useAgenda(() => schedulingService.listAll(), "agenda");
  const [filter, setFilter] = useState<Filter>("todos");
  /** Itens alterados agora continuam visíveis até trocar o filtro (o foco não se perde). */
  const [pinned, setPinned] = useState<ReadonlySet<string>>(new Set());
  const [message, setMessage] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);

  const counts = Object.fromEntries(
    STATUS_ORDER.map((status) => [status, appointments.filter((a) => a.status === status).length]),
  ) as Record<AppointmentStatus, number>;
  const visible = appointments.filter(
    (item) => filter === "todos" || item.status === filter || pinned.has(item.protocol),
  );

  const chooseFilter = (next: Filter) => {
    setFilter(next);
    setPinned(new Set());
  };

  /** Dados de exemplo só existem na demonstração (no site online, a agenda é real). */
  const demo =
    schedulingService.loadDemoData && schedulingService.clearAll ? schedulingService : null;

  const loadDemo = async () => {
    if (!demo?.loadDemoData) return;
    const count = await demo.loadDemoData();
    setMessage(`${count} agendamentos de exemplo carregados.`);
  };

  const clearAll = async () => {
    if (!demo?.clearAll) return;
    await demo.clearAll();
    setConfirmingClear(false);
    setPinned(new Set());
    setMessage("Todos os agendamentos deste navegador foram apagados.");
  };

  return (
    <div className="admin-agenda">
      <p className="admin-summary">
        {loading ? "Carregando a agenda…" : summarize(appointments, today)}
      </p>
      {error && <FieldError>{error}</FieldError>}
      <p className="sr-only-text" role="status">
        {message}
      </p>

      {appointments.length === 0 && !loading && !error ? (
        <div className="empty-state">
          <ParkedCar />
          <p>
            A agenda está vazia. Os pedidos feitos em “Agendar avaliação” aparecem aqui
            {demo ? " na hora. Para a apresentação, carregue os exemplos." : " assim que chegam."}
          </p>
          {demo && (
            <button type="button" className="button button-small" onClick={loadDemo}>
              Carregar exemplos
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="filter-group" role="group" aria-label="Filtrar por situação">
            {(["todos", ...STATUS_ORDER] as Filter[]).map((option) => (
              <button
                key={option}
                type="button"
                className="filter-button"
                aria-pressed={filter === option}
                onClick={() => chooseFilter(option)}
              >
                {FILTER_LABEL[option]}
                <span className="filter-count">
                  {option === "todos" ? appointments.length : counts[option]}
                </span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="admin-empty-filter">
              Nenhum agendamento {FILTER_LABEL[filter].toLowerCase()} no momento.
            </p>
          ) : (
            groupByDay(visible, today).map(([date, items]) => (
              <section key={date} className="agenda-day" aria-labelledby={`dia-${date}`}>
                <h2 id={`dia-${date}`} className="agenda-day-title">
                  {formatLongDateTitle(date)}
                  {date === today && <span className="agenda-day-today">Hoje</span>}
                </h2>
                <ul className="agenda-list">
                  {items.map((appointment) => (
                    <li key={appointment.protocol}>
                      <AgendaItem
                        appointment={appointment}
                        onChanged={(changed, text) => {
                          setPinned((current) => new Set(current).add(changed.protocol));
                          setMessage(text);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
        </>
      )}

      {demo && (
        <section className="admin-tools" aria-labelledby="demonstracao-titulo">
          <h2 id="demonstracao-titulo" className="admin-tools-title">
            Dados de demonstração
          </h2>
          <p>
            Nesta versão, a agenda fica guardada no navegador. Os exemplos trazem pedidos em todas
            as situações (
            {STATUS_ORDER.map((status) => STATUS_LABEL[status].toLowerCase()).join(", ")}) para
            mostrar o ciclo completo.
          </p>
          {confirmingClear ? (
            <InlineConfirm
              question="Apagar todos os agendamentos deste navegador? Não dá para desfazer."
              confirmLabel="Sim, apagar tudo"
              cancelLabel="Não, manter"
              onConfirm={clearAll}
              onCancel={() => setConfirmingClear(false)}
            />
          ) : (
            <div className="admin-tools-actions">
              <button
                type="button"
                className="button button-small button-outline"
                onClick={loadDemo}
              >
                Carregar exemplos
              </button>
              {appointments.length > 0 && (
                <button
                  type="button"
                  className="button button-small button-outline"
                  onClick={() => setConfirmingClear(true)}
                >
                  Apagar todos os agendamentos
                </button>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
