import { useRef, useState } from "react";
import { href } from "@/app/router";
import { ParkedCar } from "@/components/car/ParkedCar";
import { PageHeader } from "@/components/layout/PageHeader";
import { schedulingService } from "@/features/scheduling";
import { LAST_PHONE_KEY } from "@/features/scheduling/components/booking/model";
import { CustomerAppointmentCard } from "@/features/scheduling/components/customer/CustomerAppointmentCard";
import { LookupForm, type Credentials } from "@/features/scheduling/components/customer/LookupForm";
import { useAgenda } from "@/features/scheduling/hooks/useAgenda";

function lastPhone(): string {
  try {
    return sessionStorage.getItem(LAST_PHONE_KEY) ?? "";
  } catch {
    return "";
  }
}

/**
 * Meus agendamentos (UC-18 Consultar Histórico, com UC-16 Cancelar e
 * UC-19 Avaliar a partir de cada agendamento). A lista se atualiza sozinha
 * quando a oficina muda a situação em outra aba.
 */
export function MyAppointmentsPage({ params }: { params: URLSearchParams }) {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [message, setMessage] = useState("");
  const resultsTitle = useRef<HTMLHeadingElement>(null);

  const { data: appointments } = useAgenda(
    () =>
      credentials
        ? schedulingService.lookup(credentials.phone, credentials.protocol)
        : Promise.resolve(null),
    credentials ? `${credentials.phone}:${credentials.protocol}` : "sem-consulta",
  );

  return (
    <div className="page container-site">
      <PageHeader
        title="Meus agendamentos"
        lead="Com o telefone e o protocolo do comprovante, você vê a situação, cancela ou avalia o atendimento."
      />

      <div className="lookup-layout">
        <LookupForm
          initialPhone={lastPhone()}
          initialProtocol={params.get("protocolo") ?? ""}
          onFound={(found) => {
            setMessage("");
            setCredentials(found);
            // Leva o foco ao resultado, para o leitor de tela anunciar o que foi encontrado.
            requestAnimationFrame(() => resultsTitle.current?.focus());
          }}
        />

        <section className="lookup-results" aria-labelledby="resultados-titulo">
          <h2
            id="resultados-titulo"
            ref={resultsTitle}
            tabIndex={-1}
            className="lookup-results-title"
          >
            {appointments ? "Seus agendamentos" : "Nenhuma consulta ainda"}
          </h2>
          <p className="sr-only-text" role="status">
            {message ||
              (appointments
                ? `${appointments.length} ${appointments.length === 1 ? "agendamento encontrado" : "agendamentos encontrados"}.`
                : "")}
          </p>

          {appointments ? (
            <ul className="appointment-list">
              {appointments.map((appointment) => (
                <li key={appointment.protocol}>
                  <CustomerAppointmentCard
                    appointment={appointment}
                    phone={credentials?.phone ?? ""}
                    onMessage={setMessage}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <ParkedCar />
              <p>
                Digite o telefone e o protocolo para ver seus agendamentos. Ainda não agendou?{" "}
                <a className="text-link" href={href("agendar")}>
                  Agende uma avaliação
                </a>
                .
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
