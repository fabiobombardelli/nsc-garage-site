import type { Ref } from "react";
import carImage from "@/assets/images/drift-car-top.webp";

type DriftCarProps = { ref: Ref<HTMLDivElement> };

/** Carro visto de cima, com fumaça saindo dos pneus traseiros. */
export function DriftCar({ ref }: DriftCarProps) {
  return (
    <div ref={ref} className="drift-car" aria-hidden="true">
      <div className="drift-car-smoke">
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} className="drift-car-puff" />
        ))}
      </div>
      <img className="drift-car-image" src={carImage} width={459} height={962} alt="" />
    </div>
  );
}
