import type { Ref } from "react";
import carImage from "@/assets/images/drift-car-top.webp";
import { cn } from "@/lib/cn";

type DriftCarProps = {
  ref?: Ref<HTMLDivElement>;
  className?: string;
};

/**
 * O 350Z #69 visto de cima, com fumaça saindo dos pneus traseiros.
 * A posição vem de fora: na Trajetória pelo hook useDriftCar, no rodapé
 * pela animação do zerinho.
 */
export function DriftCar({ ref, className }: DriftCarProps) {
  return (
    <div ref={ref} className={cn("drift-car", className)} aria-hidden="true">
      <div className="drift-car-smoke">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className="drift-car-puff" />
        ))}
      </div>
      <img className="drift-car-image" src={carImage} width={240} height={488} alt="" />
    </div>
  );
}
