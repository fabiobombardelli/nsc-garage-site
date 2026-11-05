import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DriftCar } from "@/components/car/DriftCar";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { getCarPoseAtLength } from "@/lib/track";

/** Área de desenho (unidades do viewBox). */
const VIEW = { width: 560, height: 240 };
const CONE = { x: 360, y: 120 };
/** Entrada: o carro vem da esquerda e chega por baixo do cone, já na tangente do círculo. */
const ENTRY = "M -60 210 C 120 210 250 200 360 200";
/** O "zerinho": um círculo de 80 de raio em volta do cone, começando e terminando embaixo. */
const DONUT = [
  "M 360 200",
  "A 80 80 0 0 0 440 120",
  "A 80 80 0 0 0 360 40",
  "A 80 80 0 0 0 280 120",
  "A 80 80 0 0 0 360 200",
].join(" ");
/** Velocidade do carro, em unidades do viewBox por segundo (uma volta a cada ~2 s). */
const SPEED = 250;

/**
 * Comemoração do comprovante: o 350Z entra e fica fazendo "zerinhos" em
 * volta do cone, sem parar, enquanto a borracha escurece no chão.
 *
 * Acessibilidade: botão de pausa (WCAG 2.2.2, movimento contínuo); para
 * quando sai da tela; com movimento reduzido, a cena aparece parada, com o
 * círculo de borracha já marcado.
 */
export function DonutFinish() {
  const padRef = useRef<HTMLDivElement>(null);
  const entryRef = useRef<SVGPathElement>(null);
  const donutRef = useRef<SVGPathElement>(null);
  const entryMarkRef = useRef<SVGGElement>(null);
  const donutMarkRef = useRef<SVGGElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const distanceRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const onScreen = useInView(padRef, { threshold: 0.15 });
  const running = onScreen && !paused && !reduceMotion;

  /** Posiciona o carro e a borracha para uma distância percorrida. */
  const place = useCallback((distance: number) => {
    const pad = padRef.current;
    const entry = entryRef.current;
    const donut = donutRef.current;
    const car = carRef.current;
    if (!pad || !entry || !donut || !car) return;

    const entryLength = entry.getTotalLength();
    const donutLength = donut.getTotalLength();
    const onDonut = distance > entryLength;
    const pose = onDonut
      ? getCarPoseAtLength(donut, distance - entryLength, donutLength, { loop: true })
      : getCarPoseAtLength(entry, distance, entryLength);
    const scale = pad.clientWidth / VIEW.width;

    car.style.setProperty("--car-x", `${pose.x * scale}px`);
    car.style.setProperty("--car-y", `${pose.y * scale}px`);
    car.style.setProperty("--car-rotation", `${pose.rotation}deg`);
    car.style.setProperty("--drift-force", `${pose.driftForce}`);
    car.style.setProperty("--smoke-sway", `${-pose.driftDirection * 28}px`);

    // A entrada fica marcada; o círculo vai sendo desenhado na primeira volta e escurece a cada volta.
    const drawMarks = (group: SVGGElement | null, length: number, drawn: number) =>
      group?.querySelectorAll("path").forEach((mark) => {
        mark.style.strokeDasharray = `${length}`;
        mark.style.strokeDashoffset = `${Math.max(0, length - drawn)}`;
      });
    drawMarks(entryMarkRef.current, entryLength, distance);
    drawMarks(donutMarkRef.current, donutLength, distance - entryLength);
    const laps = Math.max(0, (distance - entryLength) / donutLength);
    if (donutMarkRef.current) {
      donutMarkRef.current.style.opacity = String(Math.min(0.75, 0.45 + Math.floor(laps) * 0.05));
    }
  }, []);

  useEffect(() => {
    const entry = entryRef.current;
    const donut = donutRef.current;
    const car = carRef.current;
    if (!entry || !donut || !car) return;

    if (reduceMotion && distanceRef.current === 0) {
      // Parado ao lado do cone, com o círculo inteiro já marcado.
      distanceRef.current = entry.getTotalLength() + donut.getTotalLength() * 1.25;
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
    <div className="donut-finish-wrap">
      <div ref={padRef} className="donut-finish" aria-hidden="true">
        <svg viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} focusable="false">
          <path ref={entryRef} d={ENTRY} fill="none" stroke="none" />
          <path ref={donutRef} d={DONUT} fill="none" stroke="none" />
          <g ref={entryMarkRef} className="donut-finish-marks">
            <path className="mark-inner" d={ENTRY} />
            <path className="mark-outer" d={ENTRY} />
          </g>
          <g ref={donutMarkRef} className="donut-finish-marks">
            <path className="mark-inner" d={DONUT} />
            <path className="mark-outer" d={DONUT} />
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

      {!reduceMotion && (
        <button
          type="button"
          className="icon-button donut-finish-toggle"
          onClick={() => setPaused((current) => !current)}
          aria-label={paused ? "Retomar o zerinho do carro" : "Pausar o zerinho do carro"}
        >
          {paused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
