import { animate } from "motion/react";
import { useCallback, useEffect, useRef } from "react";
import { DriftCar } from "@/components/car/DriftCar";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getCarPoseAtLength } from "@/lib/track";

/** Área de desenho (unidades do viewBox). */
const VIEW = { width: 560, height: 240 };
const CONE = { x: 360, y: 120 };
/**
 * O carro entra pela esquerda, chega por baixo do cone e dá uma volta e
 * um quarto em volta dele (quatro arcos de 80 de raio = uma volta), parando
 * do lado direito.
 */
const PATH = [
  "M -60 210 C 120 210 250 200 360 200",
  "A 80 80 0 0 0 440 120",
  "A 80 80 0 0 0 360 40",
  "A 80 80 0 0 0 280 120",
  "A 80 80 0 0 0 360 200",
  "A 80 80 0 0 0 440 120",
].join(" ");
const DURATION = 2.6;

/**
 * Comemoração do comprovante: o 350Z entra e faz um "zerinho" em volta
 * do cone, deixando a borracha no chão. Toca uma vez só, em menos de
 * 3 segundos (abaixo dos 5 s que pediriam botão de pausa, WCAG 2.2.2).
 *
 * Com movimento reduzido, a cena já aparece pronta: carro parado ao lado
 * do cone e o círculo de borracha marcado.
 */
export function DonutFinish() {
  const padRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const marksRef = useRef<SVGGElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const lengthRef = useRef(0);
  const reduceMotion = useReducedMotion();

  const place = useCallback((length: number) => {
    const pad = padRef.current;
    const path = pathRef.current;
    const car = carRef.current;
    if (!pad || !path || !car) return;

    const total = path.getTotalLength();
    const pose = getCarPoseAtLength(path, length, total);
    const scale = pad.clientWidth / VIEW.width;
    car.style.setProperty("--car-x", `${pose.x * scale}px`);
    car.style.setProperty("--car-y", `${pose.y * scale}px`);
    car.style.setProperty("--car-rotation", `${pose.rotation}deg`);
    car.style.setProperty("--drift-force", `${pose.driftForce}`);
    car.style.setProperty("--smoke-sway", `${-pose.driftDirection * 28}px`);
    marksRef.current?.querySelectorAll("path").forEach((mark) => {
      mark.style.strokeDasharray = `${total}`;
      mark.style.strokeDashoffset = `${total - length}`;
    });
    lengthRef.current = length;
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const car = carRef.current;
    if (!path || !car) return;
    const total = path.getTotalLength();

    if (reduceMotion) {
      place(total);
      return;
    }

    car.dataset.moving = "true";
    const controls = animate(0, total, {
      duration: DURATION,
      ease: [0.3, 0.7, 0.4, 1],
      onUpdate: place,
      onComplete: () => {
        car.dataset.moving = "false";
      },
    });
    return () => {
      controls.stop();
      car.dataset.moving = "false";
    };
  }, [reduceMotion, place]);

  useEffect(() => {
    const onResize = () => place(lengthRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [place]);

  return (
    <div ref={padRef} className="donut-finish" aria-hidden="true">
      <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} focusable="false">
        <path ref={pathRef} d={PATH} fill="none" stroke="none" />
        <g ref={marksRef} className="donut-finish-marks">
          <path className="mark-inner" d={PATH} />
          <path className="mark-outer" d={PATH} />
        </g>
        <g className="cone is-lit" transform={`translate(${CONE.x} ${CONE.y})`}>
          <rect className="cone-base" x="-13" y="-13" width="26" height="26" />
          <circle className="cone-body" r="11" />
          <circle className="cone-band" r="7" />
          <circle className="cone-tip" r="3.5" />
        </g>
      </svg>
      <DriftCar ref={carRef} className="donut-finish-car" />
    </div>
  );
}
