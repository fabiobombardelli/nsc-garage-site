import carImage from "@/assets/images/drift-car-top.webp";
import { cn } from "@/lib/cn";

/**
 * O 350Z estacionado numa vaga pintada no piso do box. Ilustração parada
 * para os estados vazios ("nenhum agendamento ainda"). Decorativa.
 */
export function ParkedCar({ className }: { className?: string }) {
  return (
    <div className={cn("parked-car", className)} aria-hidden="true">
      <img src={carImage} width={240} height={488} alt="" />
    </div>
  );
}
