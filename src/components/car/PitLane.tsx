import { animate } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { DriftCar } from "@/components/car/DriftCar";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { buildLanePath, getCarPoseAtLength, lengthAt, type TrackPoint } from "@/lib/track";

type PitLaneProps = {
  /** Nome de cada etapa, na ordem. */
  steps: readonly string[];
  /** Etapa atual (começa em 0). */
  current: number;
};

type Size = { width: number; height: number; lane: number };

/** Monta a pista: um ápice por etapa, alternando para cima e para baixo. */
function buildGeometry({ width, height, lane }: Size, count: number) {
  const middle = height / 2;
  const swing = height * 0.16;
  const apexes: TrackPoint[] = Array.from({ length: count }, (_, index) => ({
    x: ((index + 0.5) * width) / count,
    y: middle + (index % 2 === 0 ? -swing : swing),
  }));
  // O cone fica do lado de dentro da curva, como na pista da Trajetória.
  const cones = apexes.map((apex, index) => ({
    x: apex.x,
    y: apex.y + (index % 2 === 0 ? 1 : -1) * (lane / 2 + 14),
  }));
  const path = buildLanePath([{ x: -lane, y: middle }, ...apexes, { x: width + lane, y: middle }]);
  return { apexes, cones, path };
}

/**
 * Progresso do agendamento como uma pista de box: um cone por etapa e o
 * 350Z, que dirige até o cone da etapa atual a cada avanço (ou volta de
 * ré). O movimento mostra o estado: cada cone aceso é uma etapa vencida.
 *
 * Acessibilidade: o desenho é decorativo (aria-hidden). A informação vai
 * na lista de etapas logo abaixo, com `aria-current="step"`. Com movimento
 * reduzido, o carro aparece direto no cone, sem andar.
 */
export function PitLane({ steps, current }: PitLaneProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const rubberRef = useRef<SVGPathElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const lengthRef = useRef(0);
  const placedStepRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();
  const [size, setSize] = useState<Size | null>(null);
  const [arrived, setArrived] = useState(-1);

  // Mede a pista em pixels (as medidas vêm do CSS e mudam no celular).
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const style = getComputedStyle(stage);
      setSize({
        width: stage.clientWidth,
        height: stage.clientHeight,
        lane: parseFloat(style.getPropertyValue("--lane-width")) || 40,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const geometry = useMemo(() => (size ? buildGeometry(size, steps.length) : null), [size, steps]);

  /** Coloca o carro e a borracha a `length` pixels do início da pista. */
  const place = useCallback((length: number) => {
    const path = pathRef.current;
    const car = carRef.current;
    if (!path || !car) return;
    const total = path.getTotalLength();
    const pose = getCarPoseAtLength(path, length, total);
    car.style.setProperty("--car-x", `${pose.x}px`);
    car.style.setProperty("--car-y", `${pose.y}px`);
    car.style.setProperty("--car-rotation", `${pose.rotation}deg`);
    car.style.setProperty("--drift-force", `${pose.driftForce}`);
    car.style.setProperty("--smoke-sway", `${-pose.driftDirection * 24}px`);
    const rubber = rubberRef.current;
    if (rubber) {
      rubber.style.strokeDasharray = `${total}`;
      rubber.style.strokeDashoffset = `${total - length}`;
    }
    lengthRef.current = length;
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const car = carRef.current;
    const apex = geometry?.apexes[current];
    if (!path || !car || !apex) return;

    const target = lengthAt(path, "x", apex.x);
    const firstTime = placedStepRef.current === null;
    const stepChanged = placedStepRef.current !== current;
    placedStepRef.current = current;

    // Só a largura mudou (ou movimento reduzido): o carro vai direto para o lugar.
    if (reduceMotion || (!firstTime && !stepChanged)) {
      place(target);
      setArrived(current);
      return;
    }

    // Na primeira vez o carro entra pela esquerda; depois, sai do cone em que estava.
    const from = firstTime ? 0 : lengthRef.current;
    car.dataset.moving = "true";
    const controls = animate(from, target, {
      duration: firstTime ? 0.9 : 1,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: place,
      onComplete: () => {
        car.dataset.moving = "false";
        setArrived(current);
      },
    });
    return () => {
      controls.stop();
      car.dataset.moving = "false";
    };
  }, [geometry, current, reduceMotion, place]);

  return (
    <div className="pit-lane" style={{ "--steps": steps.length } as CSSProperties}>
      <div ref={stageRef} className="pit-lane-stage" aria-hidden="true">
        {geometry && size && (
          <svg viewBox={`0 0 ${size.width} ${size.height}`} focusable="false">
            <path className="pit-lane-edge" d={geometry.path} />
            <path className="pit-lane-asphalt" d={geometry.path} />
            <path className="pit-lane-centre" d={geometry.path} />
            <path ref={rubberRef} className="pit-lane-rubber" d={geometry.path} />
            <path ref={pathRef} d={geometry.path} fill="none" stroke="none" />
            {geometry.cones.map((cone, index) => (
              <g
                key={index}
                className={index <= arrived ? "cone is-lit" : "cone"}
                transform={`translate(${cone.x} ${cone.y})`}
              >
                <circle className="cone-ring" r="13" />
                <rect className="cone-base" x="-10" y="-10" width="20" height="20" />
                <circle className="cone-body" r="8.5" />
                <circle className="cone-band" r="5.5" />
                <circle className="cone-tip" r="2.75" />
              </g>
            ))}
          </svg>
        )}
        <DriftCar ref={carRef} className="pit-lane-car" />
      </div>

      <ol className="pit-lane-steps">
        {steps.map((label, index) => {
          const state = index < current ? "feito" : index === current ? "atual" : "proximo";
          return (
            <li
              key={label}
              data-state={state}
              aria-current={index === current ? "step" : undefined}
            >
              <span className="pit-lane-step-number" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                <span className="sr-only-text">Etapa {index + 1}: </span>
                {label}
                {state === "feito" && <span className="sr-only-text"> (concluída)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
