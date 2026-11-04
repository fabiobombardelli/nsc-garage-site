import { useRef } from "react";
import { DriftCar } from "@/components/timeline/DriftCar";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";

/**
 * O encerramento: quando o rodapé aparece, o 350Z dá três zerinhos e deixa
 * os círculos de borracha no chão. Acontece uma vez (ver footer.css).
 */
export function DonutCar() {
  const ref = useRef<HTMLDivElement>(null);
  const running = useInView(ref, { threshold: 0.6, once: true });

  return (
    <div ref={ref} className={cn("donut", running && "is-running")} aria-hidden="true">
      <svg className="donut-marks" viewBox="-100 -100 200 200">
        <circle r="62" pathLength={1} />
        <circle r="76" pathLength={1} />
      </svg>
      <div className="donut-orbit">
        <DriftCar className="donut-car" />
      </div>
    </div>
  );
}
