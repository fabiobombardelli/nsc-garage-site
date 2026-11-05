import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DriftCar } from "@/components/car/DriftCar";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { buildFigureEightPath, getCarPoseAtLength } from "@/lib/track";

/** Área de desenho do "8" (unidades do viewBox). */
const VIEW = { width: 640, height: 300 };
const CENTER = { x: VIEW.width / 2, y: VIEW.height / 2 };
const RADIUS = { x: 270, y: 112 };
const PATH = buildFigureEightPath(CENTER.x, CENTER.y, RADIUS.x, RADIUS.y);
/** Os dois cones que o carro contorna, no centro de cada laço. */
const CONES = [CENTER.x - RADIUS.x * 0.56, CENTER.x + RADIUS.x * 0.56];
/** Velocidade do carro, em unidades do viewBox por segundo. */
const SPEED = 240;

/**
 * O fechamento da página: o 350Z faz oitos em volta de dois cones, sem
 * parar, deixando borracha no chão vermelho. Roda só enquanto está visível.
 *
 * Acessibilidade: botão de pausa (WCAG 2.2.2); com movimento reduzido o
 * carro fica parado sobre o "8" já desenhado.
 */
export function FigureEight() {
  const padRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const marksRef = useRef<SVGGElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const distanceRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const onScreen = useInView(padRef, { threshold: 0.15 });
  const running = onScreen && !paused && !reduceMotion;

  /** Posiciona o carro e a borracha para uma distância percorrida. */
  const place = useCallback((distance: number) => {
    const pad = padRef.current;
    const path = pathRef.current;
    const car = carRef.current;
    if (!pad || !path || !car) return;

    const total = path.getTotalLength();
    const pose = getCarPoseAtLength(path, distance, total, { loop: true });
    const scale = pad.clientWidth / VIEW.width;

    car.style.setProperty("--car-x", `${pose.x * scale}px`);
    car.style.setProperty("--car-y", `${pose.y * scale}px`);
    car.style.setProperty("--car-rotation", `${pose.rotation}deg`);
    car.style.setProperty("--drift-force", `${pose.driftForce}`);
    car.style.setProperty("--smoke-sway", `${-pose.driftDirection * 30}px`);

    // Na primeira volta a borracha vai sendo desenhada; depois fica e escurece aos poucos.
    const laps = distance / total;
    const marks = marksRef.current;
    if (marks) {
      marks.style.opacity = String(Math.min(0.55, 0.3 + Math.floor(laps) * 0.06));
      marks.querySelectorAll("path").forEach((mark) => {
        mark.style.strokeDasharray = `${total}`;
        mark.style.strokeDashoffset = `${Math.max(0, total - distance)}`;
      });
    }
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    const car = carRef.current;
    if (!path || !car) return;

    if (reduceMotion && distanceRef.current === 0) {
      // Parado num ponto da curva, com o "8" inteiro já marcado no chão.
      distanceRef.current = path.getTotalLength() * 1.3;
    }
    place(distanceRef.current);
    car.dataset.moving = String(running);
    if (!running) return;

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const elapsed = Math.min(0.05, (now - last) / 1000);
      last = now;
      distanceRef.current += SPEED * elapsed;
      place(distanceRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, reduceMotion, place]);

  useEffect(() => {
    const onResize = () => place(distanceRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [place]);

  return (
    <div className="figure-eight">
      <div ref={padRef} className="figure-eight-pad" aria-hidden="true">
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} focusable="false">
          <path ref={pathRef} d={PATH} fill="none" stroke="none" />
          <g ref={marksRef} className="figure-eight-marks">
            <path className="mark-inner" d={PATH} />
            <path className="mark-outer" d={PATH} />
          </g>
          {CONES.map((x) => (
            <g key={x} className="cone is-lit" transform={`translate(${x} ${CENTER.y})`}>
              <rect className="cone-base" x="-12" y="-12" width="24" height="24" />
              <circle className="cone-body" r="10" />
              <circle className="cone-band" r="6.5" />
              <circle className="cone-tip" r="3.25" />
            </g>
          ))}
        </svg>
        <DriftCar ref={carRef} className="figure-eight-car" />
      </div>

      {!reduceMotion && (
        <button
          type="button"
          className="icon-button figure-eight-toggle"
          onClick={() => setPaused((current) => !current)}
          aria-label={paused ? "Retomar a animação do carro" : "Pausar a animação do carro"}
        >
          {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
