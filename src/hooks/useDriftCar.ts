import { useEffect, useRef } from "react";
import { getCarPose, TRACK_VIEWBOX } from "@/lib/track";

/** Ponto da tela (fração da altura da janela) onde o carro "acompanha" a rolagem. */
const VIEWPORT_ANCHOR = 0.5;

/**
 * Faz o carro percorrer a pista conforme a página rola.
 *
 * Os valores calculados são passados ao CSS via variáveis
 * (`--car-x`, `--car-y`, `--car-rotation`, `--drift-force`, `--smoke-sway`),
 * então todo o visual continua controlado em `timeline.css`.
 */
export function useDriftCar() {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const stage = stageRef.current;
      const track = trackRef.current;
      const path = pathRef.current;
      const car = carRef.current;
      if (!stage || !track || !path || !car) return;

      const stageRect = stage.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const scaleX = trackRect.width / TRACK_VIEWBOX.width;
      const scaleY = trackRect.height / TRACK_VIEWBOX.height;

      const anchorY = window.innerHeight * VIEWPORT_ANCHOR - trackRect.top;
      const targetY = Math.min(TRACK_VIEWBOX.height, Math.max(0, anchorY / scaleY));
      const pose = getCarPose(path, targetY);

      const x = trackRect.left - stageRect.left + pose.x * scaleX;
      const y = trackRect.top - stageRect.top + pose.y * scaleY;
      const smokeSway = -pose.driftDirection * (12 + pose.driftForce * 26);

      car.style.setProperty("--car-x", `${x}px`);
      car.style.setProperty("--car-y", `${y}px`);
      car.style.setProperty("--car-rotation", `${pose.rotation}deg`);
      car.style.setProperty("--drift-force", `${pose.driftForce}`);
      car.style.setProperty("--smoke-sway", `${smokeSway}px`);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return { stageRef, trackRef, pathRef, carRef };
}
