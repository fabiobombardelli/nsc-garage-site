import gsap from "gsap";
import carUrl from "@site/assets/images/drift-car-top.webp";
import { getCarPoseAtLength } from "@site/lib/track";
import { h, s } from "../../dom";

export { carUrl };

/** Proporção da imagem do carro (240×488, dianteira para baixo). */
const CAR_RATIO = 488 / 240;

/**
 * O 350Z #69 visto de cima, como no site, num container posicionado.
 * `place(x, y, rotation)` usa a mesma convenção da pista do site: a imagem
 * tem a dianteira para baixo, então rotação -90° aponta para a direita.
 */
export class Car2D {
  readonly el: HTMLElement;
  x = -400;
  y = -400;
  rotation = 0;
  private lastPuff = 0;

  constructor(
    private readonly container: HTMLElement,
    readonly width = 64,
  ) {
    this.el = h(
      "div",
      { class: "car2d", style: `--car-w:${width}px` },
      h("img", { src: carUrl, alt: "", width: 240, height: 488, draggable: "false" }),
    );
    container.append(this.el);
  }

  get length() {
    return this.width * CAR_RATIO;
  }

  place(x: number, y: number, rotation: number) {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.el.style.setProperty("--x", `${x}px`);
    this.el.style.setProperty("--y", `${y}px`);
    this.el.style.setProperty("--r", `${rotation}deg`);
  }

  /** Solta fumaça pelos pneus traseiros (no máximo a cada `every` ms). */
  smoke(force = 0.6, every = 100) {
    const now = performance.now();
    if (now - this.lastPuff < every) return;
    this.lastPuff = now;
    const rad = (this.rotation * Math.PI) / 180;
    // Frente da imagem = +y; girada pela rotação do carro.
    const fx = -Math.sin(rad);
    const fy = Math.cos(rad);
    const rear = this.length * 0.36;
    const side = this.width * 0.34;
    for (const sign of [-1, 1]) {
      const px = this.x - fx * rear + fy * side * sign;
      const py = this.y - fy * rear - fx * side * sign;
      puff(this.container, px, py, this.width * (0.7 + force * 0.5), -fx, -fy);
    }
  }
}

/** Nuvens vivas por container (limite para não pesar no notebook do projetor). */
const alive = new WeakMap<HTMLElement, number>();
const MAX_PUFFS = 32;

/** Uma nuvem de fumaça que cresce e some. */
export function puff(container: HTMLElement, x: number, y: number, size: number, dx = 0, dy = -1) {
  const count = alive.get(container) ?? 0;
  if (count >= MAX_PUFFS || !container.isConnected) return;
  alive.set(container, count + 1);
  const el = h("span", { class: "puff" });
  el.style.width = el.style.height = `${size}px`;
  el.style.left = `${x - size / 2}px`;
  el.style.top = `${y - size / 2}px`;
  container.append(el);
  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.45 },
    {
      keyframes: [
        { opacity: 0.55, scale: 1, duration: 0.35, ease: "power1.out" },
        {
          opacity: 0,
          scale: 2.4,
          x: dx * size * 0.9 + (Math.random() - 0.5) * size,
          y: dy * size * 0.9 - size * 0.4,
          duration: 1.2,
          ease: "power1.out",
        },
      ],
      onComplete: () => {
        el.remove();
        alive.set(container, Math.max(0, (alive.get(container) ?? 1) - 1));
      },
    },
  );
}

/** Leva o carro ao longo de um traçado SVG (coordenadas 1:1 com o container). */
export function driveTween(
  car: Car2D,
  path: SVGPathElement,
  from: number,
  to: number,
  duration: number,
  opts: {
    ease?: string;
    smoke?: boolean;
    offsetX?: number;
    offsetY?: number;
    onMove?: (d: number) => void;
  } = {},
) {
  const total = path.getTotalLength();
  const state = { d: from };
  const ox = opts.offsetX ?? 0;
  const oy = opts.offsetY ?? 0;
  return gsap.fromTo(
    state,
    { d: from },
    {
      d: to,
      duration,
      ease: opts.ease ?? "power1.inOut",
      onUpdate: () => {
        const pose = getCarPoseAtLength(path, state.d, total);
        car.place(pose.x + ox, pose.y + oy, pose.rotation);
        if (opts.smoke !== false && Math.abs(to - from) > 1) car.smoke(pose.driftForce);
        opts.onMove?.(state.d);
      },
    },
  );
}

/**
 * Zerinho em volta de um ponto: o carro gira com a dianteira para dentro
 * da curva, soltando fumaça. Devolve a função que para o movimento.
 */
export function donut(
  car: Car2D,
  cx: number,
  cy: number,
  radius: number,
  opts: { speed?: number; drift?: number; start?: number } = {},
) {
  const speed = opts.speed ?? 2.4; // rad/s
  const drift = opts.drift ?? 52;
  let angle = opts.start ?? 0;
  let last = performance.now();
  let raf = 0;
  const loop = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    angle += speed * dt;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    const heading = (Math.atan2(Math.cos(angle), -Math.sin(angle)) * 180) / Math.PI;
    car.place(x, y, heading - 90 + drift);
    car.smoke(1, 85);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}

/** Cone visto de cima (base de borracha, corpo laca, faixa branca e anel). */
export function cone2d(x: number, y: number, scale = 1): SVGGElement {
  return s(
    "g",
    { class: "cone2d", transform: `translate(${x} ${y}) scale(${scale})` },
    s("rect", { class: "cone-base", x: -12, y: -12, width: 24, height: 24 }),
    s("circle", { class: "cone-body", r: 10 }),
    s("circle", { class: "cone-band", r: 6.5 }),
    s("circle", { class: "cone-tip", r: 3.25 }),
    s("circle", { class: "cone-ring", r: 16 }),
  );
}

/** Anel que se expande quando o cone "acende". */
export function lightCone(cone: SVGGElement, tl?: gsap.core.Timeline, at?: gsap.Position) {
  const ring = cone.querySelector(".cone-ring");
  const tween = gsap.fromTo(
    ring,
    { opacity: 0.95, scale: 0.5, transformOrigin: "50% 50%" },
    { opacity: 0, scale: 1.9, duration: 0.9, ease: "power2.out", immediateRender: false },
  );
  const fade = gsap.to(cone, { opacity: 1, duration: 0.3, immediateRender: false });
  if (tl) {
    tl.add(fade, at);
    tl.add(tween, "<");
  }
  return tween;
}

/** Número que conta até o valor (texto atualizado a cada quadro). */
export function countTo(
  el: HTMLElement,
  to: number,
  duration: number,
  format = (n: number) => String(n),
) {
  const state = { n: 0 };
  return gsap.fromTo(
    state,
    { n: 0 },
    {
      n: to,
      duration,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = format(Math.round(state.n));
      },
    },
  );
}
