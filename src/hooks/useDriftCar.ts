import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { buildTrackPath, getCarPose, type TrackPoint } from "@/lib/track";

/** Ponto da tela (fração da altura da janela) que o carro acompanha. */
const VIEWPORT_ANCHOR = 0.5;
/** Depois de quanto tempo sem rolagem o carro "para" e a fumaça some. */
const IDLE_AFTER_MS = 220;

export type ConePoint = TrackPoint & { id: number };

export type TrackGeometry = {
  width: number;
  height: number;
  /** Quanto o desenho avança acima da área dos marcos, em px. */
  overhangTop: number;
  path: string;
  cones: ConePoint[];
};

/** Lê um número declarado como variável CSS na área da pista (ver timeline.css). */
function cssNumber(element: Element, name: string): number {
  return Number.parseFloat(getComputedStyle(element).getPropertyValue(name)) || 0;
}

/**
 * Desenha a faixa no piso do box a partir das posições dos marcos e faz o
 * carro percorrê-la conforme a página rola: ele deixa borracha, solta
 * fumaça enquanto se move e acende o cone de cada marco por onde passa.
 *
 * O carro recebe a posição como variáveis CSS (--car-x, --car-y,
 * --car-rotation, --drift-force, --smoke-sway) e o atributo data-moving;
 * o visual fica em timeline.css.
 */
export function useDriftCar() {
  const stageRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tyreMarksRef = useRef<SVGGElement>(null);
  const conesRef = useRef<SVGGElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<TrackGeometry | null>(null);

  // 1. Desenha a faixa passando pelo ápice ao lado de cada marco.
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const list = listRef.current;
    if (!stage || !list) return;

    const width = stage.clientWidth;
    const overhangTop = cssNumber(stage, "--track-overhang-top");
    const overhangBottom = cssNumber(stage, "--track-overhang-bottom");
    const amplitude = cssNumber(stage, "--track-amplitude");
    const coneGap = cssNumber(stage, "--track-half-width") + cssNumber(stage, "--cone-gap");
    const centerX =
      width * cssNumber(stage, "--track-center-fraction") +
      cssNumber(stage, "--track-center-offset");
    const height = stage.clientHeight + overhangTop + overhangBottom;

    const stageRect = stage.getBoundingClientRect();
    const items = Array.from(list.children) as HTMLElement[];
    const points: TrackPoint[] = [{ x: centerX, y: 0 }];
    const cones: ConePoint[] = [];

    items.forEach((item, index) => {
      // O cone fica na borda da faixa voltada para o conteúdo do marco.
      const content = (item.firstElementChild as HTMLElement | null) ?? item;
      const contentRect = content.getBoundingClientRect();
      const contentCenter = contentRect.left + contentRect.width / 2 - stageRect.left;
      const contentSide = contentCenter < centerX ? -1 : 1;
      // As curvas alternam de lado, uma por marco.
      const apexSide = index % 2 === 0 ? -1 : 1;
      const itemRect = item.getBoundingClientRect();
      const y = overhangTop + itemRect.top - stageRect.top + itemRect.height / 2;
      const x = centerX + apexSide * amplitude;
      points.push({ x, y });
      cones.push({ id: index, x: x + contentSide * coneGap, y });
    });
    points.push({ x: centerX, y: height });

    setGeometry({ width, height, overhangTop, path: buildTrackPath(points), cones });
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
    let idleTimer = 0;

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

      conesRef.current?.querySelectorAll<SVGElement>("[data-y]").forEach((cone) => {
        cone.classList.toggle("is-lit", Number(cone.dataset.y) <= pose.y);
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      // Enquanto a página rola o carro está "acelerando"; parado, a fumaça assenta.
      carRef.current?.setAttribute("data-moving", "true");
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(
        () => carRef.current?.setAttribute("data-moving", "false"),
        IDLE_AFTER_MS,
      );
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [geometry]);

  return { geometry, stageRef, listRef, pathRef, tyreMarksRef, conesRef, carRef };
}
