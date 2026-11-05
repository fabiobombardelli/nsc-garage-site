import { PageHeader } from "@/components/layout/PageHeader";
import { BookingWizard } from "@/features/scheduling/components/booking/BookingWizard";

/** Agendar avaliação (UC-12). `?servico=drift` já começa com o serviço escolhido. */
export function BookingPage({ params }: { params: URLSearchParams }) {
  return (
    <div className="page container-site">
      <PageHeader
        title="Agendar avaliação"
        lead="Escolha o serviço, o dia e o horário. A oficina confirma pelo WhatsApp."
      />
      <BookingWizard initialServiceId={params.get("servico")} />
    </div>
  );
}
