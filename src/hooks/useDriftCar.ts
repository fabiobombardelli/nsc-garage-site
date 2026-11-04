import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { buildTrackPath, getCarPose, type TrackPoint } from "@/lib/track";

/** Ponto da tela (fração da altura da janela) que o carro acompanha. */
const VIEWPORT_ANCHOR = 0.5;

export type ClippingPoint = TrackPoint & { id: number };

export type TrackGeometry = {
  width: number;
  height: number;
  /** Quanto o desenho avança acima da área dos marcos, em px. */
  overhangTop: number;
  path: string;
  clippingPoints: ClippingPoint[];
};

/** Lê um número declarado como variável CSS na área da pista (ver timeline.css). */
function cssNumber(element: Element, name: string): number {
  return Number.parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;
}

/**
 * Monta a pista a partir das posições dos marcos e faz o carro percorrê-la
 * conforme a página rola, deixando marcas de pneu e acendendo cada
 * clipping point por onde passa.
 *
 * Os valores do carro chegam ao CSS como variáveis (--car-x, --car-y,
 * --car-rotation, --drift-force, --smoke-sway); o visual fica em timeline.css.
 */
export function useDriftCar() {
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tyreMarksRef = useRef<SVGGElement>(null);
  const clippingRef = useRef<SVGGElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<TrackGeometry | null>(null);

  // 1. Desenha a pista passando pelo ápice ao lado de cada marco.
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const list = listRef.current;
    if (!stage || !list) return;

    const width = stage.clientWidth;
    const overhangTop = cssNumber(stage, "--track-overhang-top");
    const overhangBottom = cssNumber(stage, "--track-overhang-bottom");
    const amplitude = cssNumber(stage, "--track-amplitude");
    const markerGap = cssNumber(stage, "--track-half-width") + cssNumber(stage, "--marker-gap");
    const centerX =
      width * cssNumber(stage, "--track-center-fraction") +
      cssNumber(stage, "--track-center-offset");
    const height = stage.clientHeight + overhangTop + overhangBottom;

    const stageRect = stage.getBoundingClientRect();
    const items = Array.from(list.children) as HTMLElement[];
    const points: TrackPoint[] = [{ x: centerX, y: 0 }];
    const clippingPoints: ClippingPoint[] = [];

    items.forEach((item, index) => {
      // O clipping point fica na borda da pista voltada para o conteúdo do marco.
      const content = (item.firstElementChild as HTMLElement | null) ?? item;
      const contentRect = content.getBoundingClientRect();
      const contentCenter = contentRect.left + contentRect.width / 2 - stageRect.left;
      const cardSide = contentCenter < centerX ? -1 : 1;
      // As curvas alternam de lado, uma por marco.
      const apexSide = index % 2 === 0 ? -1 : 1;
      const itemRect = item.getBoundingClientRect();
      const y = overhangTop + itemRect.top - stageRect.top + itemRect.height / 2;
      const x = centerX + apexSide * amplitude;
      points.push({ x, y });
      clippingPoints.push({ id: index, x: x + cardSide * markerGap, y });
    });
    points.push({ x: centerX, y: height });

    setGeometry({ width, height, overhangTop, path: buildTrackPath(points), clippingPoints });
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [measure]);

  // 2. A cada quadro de rolagem, posiciona o carro e revela a borracha até ele.
  useEffect(() => {
    if (!geometry) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const stage = stageRef.current;
      const path = pathRef.current;
      const car = carRef.current;
      if (!stage || !path || !car) return;

      const trackTop = stage.getBoundingClientRect().top - geometry.overhangTop;
      const targetY = Math.min(
        geometry.height,
        Math.max(0, window.innerHeight * VIEWPORT_ANCHOR - trackTop),
      );
      const pose = getCarPose(path, targetY);
      const smokeSway = -pose.driftDirection * (12 + pose.driftForce * 26);

      car.style.setProperty("--car-x", `${pose.x}px`);
      car.style.setProperty("--car-y", `${pose.y - geometry.overhangTop}px`);
      car.style.setProperty("--car-rotation", `${pose.rotation}deg`);
      car.style.setProperty("--drift-force", `${pose.driftForce}`);
      car.style.setProperty("--smoke-sway", `${smokeSway}px`);

      tyreMarksRef.current?.querySelectorAll("path").forEach((mark) => {
        mark.style.strokeDasharray = `${pose.totalLength}`;
        mark.style.strokeDashoffset = `${pose.totalLength - pose.length}`;
      });

      clippingRef.current?.querySelectorAll<SVGElement>("[data-y]").forEach((marker) => {
        marker.classList.toggle("is-lit", Number(marker.dataset.y) <= pose.y);
      });
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
  }, [geometry]);

  return { geometry, stageRef, listRef, pathRef, tyreMarksRef, clippingRef, carRef };
}
