import "./s03-neto.css";
import gsap from "gsap";
import { milestones, type Milestone } from "@site/content/milestones";
import { h, preload, s } from "../../dom";
import { Car2D, cone2d } from "../lib/car2d";
import { Scene } from "../scene";

/** Segundos de cada foto: 15 marcos × 8 s = os 2 minutos do Neto. */
const INTERVAL = 8;
const LANE_Y = 95;
const CONE_Y = 26;
const FIRST_X = 150;
const LAST_X = 1770;

type WithPhoto = Milestone & { photo: NonNullable<Milestone["photo"]> };

/**
 * A palavra do Neto: as fotos dos marcos da Trajetória passam sozinhas,
 * com o ano girando como contador e o carro andando de cone em cone.
 * Nada na tela pede atenção: quem fala é o Neto.
 */
export class NetoScene extends Scene {
  readonly steps = 1;
  private readonly items: WithPhoto[] = milestones.filter((m): m is WithPhoto => m.photo !== null);
  private index = -1;
  private photoBox!: HTMLElement;
  private yearBox!: HTMLElement;
  private textBox!: HTMLElement;
  private credit!: HTMLElement;
  private laneCars!: HTMLElement;
  private cones: SVGGElement[] = [];
  private car!: Car2D;
  private carX = -120;
  private timer: gsap.core.Tween | null = null;
  private running = false;

  constructor() {
    super("scene-neto");
  }

  private coneX(i: number) {
    return FIRST_X + (i * (LAST_X - FIRST_X)) / Math.max(1, this.items.length - 1);
  }

  protected build() {
    void preload(this.items.map((m) => m.photo.src));
    this.photoBox = h("div", { class: "neto-photo" });
    this.yearBox = h("div", { class: "neto-year t-head" });
    this.textBox = h("div", { class: "neto-text" });
    this.credit = h("p", { class: "neto-credit" });

    const lane = s(
      "svg",
      {
        class: "neto-lane-svg",
        width: 1920,
        height: 180,
        viewBox: "0 0 1920 180",
        "aria-hidden": "true",
      },
      s("rect", { x: 0, y: 50, width: 1920, height: 90, fill: "var(--color-asphalt)" }),
      s("line", {
        x1: 0,
        y1: 50,
        x2: 1920,
        y2: 50,
        stroke: "var(--color-paint)",
        "stroke-width": 3,
      }),
      s("line", {
        x1: 0,
        y1: 140,
        x2: 1920,
        y2: 140,
        stroke: "var(--color-paint)",
        "stroke-width": 3,
      }),
      s("line", {
        x1: 0,
        y1: LANE_Y,
        x2: 1920,
        y2: LANE_Y,
        stroke: "var(--color-paint)",
        "stroke-width": 3,
        "stroke-dasharray": "22 26",
        opacity: 0.45,
      }),
    );
    this.cones = this.items.map((_, i) => {
      const cone = cone2d(this.coneX(i), CONE_Y, 1.5);
      cone.style.opacity = "0.4";
      lane.append(cone);
      return cone;
    });
    this.laneCars = h("div", { class: "neto-lane-cars" });
    const laneBox = h("div", { class: "neto-lane" }, lane, this.laneCars);
    this.car = new Car2D(this.laneCars, 46);
    this.car.place(this.carX, LANE_Y, -90);

    this.el.append(
      this.photoBox,
      h(
        "div",
        { class: "neto-left" },
        h("p", { class: "neto-kicker t-placa" }, "Trajetória · 2012–2026"),
        this.yearBox,
        this.textBox,
      ),
      this.credit,
      laneBox,
    );

    // O primeiro marco já fica pronto para a entrada.
    this.renderItem(0, false);
    this.tl
      .from(this.photoBox, { opacity: 0, duration: 1.2, ease: "power2.out" }, 0)
      .from(this.q(".neto-left"), { x: -60, opacity: 0, duration: 1, ease: "expo.out" }, 0.2)
      .from(laneBox, { y: 120, duration: 0.9, ease: "power3.out" }, 0.3);
    this.mark();
  }

  protected onStep() {
    if (this.running) return;
    this.running = true;
    this.driveTo(0);
    this.schedule();
    this.onCleanup(() => {
      this.running = false;
      this.timer?.kill();
    });
  }

  private schedule() {
    this.timer = gsap.delayedCall(INTERVAL, () => {
      if (!this.running) return;
      const next = (this.index + 1) % this.items.length;
      this.renderItem(next, true);
      if (next === 0) this.loopBack();
      else this.driveTo(next);
      this.schedule();
    });
  }

  private renderItem(i: number, animate: boolean) {
    const item = this.items[i];
    if (!item) return;
    const previousYear = this.items[this.index]?.year;
    this.index = i;

    // Foto com Ken Burns lento.
    const img = h("img", { class: "neto-img", src: item.photo.src, alt: item.photo.alt });
    img.style.transformOrigin = i % 2 ? "35% 50%" : "65% 45%";
    this.photoBox.append(img);
    const old = Array.from(this.photoBox.querySelectorAll<HTMLImageElement>(".neto-img")).slice(
      0,
      -1,
    );
    gsap.fromTo(
      img,
      { opacity: animate ? 0 : 1 },
      { opacity: 1, duration: 1.3, ease: "power2.out" },
    );
    gsap.fromTo(
      img,
      { scale: 1.03, xPercent: 0 },
      { scale: 1.14, xPercent: i % 2 ? 1.5 : -1.5, duration: INTERVAL + 1.6, ease: "none" },
    );
    old.forEach((o) =>
      gsap.to(o, { opacity: 0, duration: 1.3, delay: 0.2, onComplete: () => o.remove() }),
    );

    // Ano girando como contador (só quando muda).
    if (item.year !== previousYear) {
      const num = h("span", { class: "neto-year-num" }, String(item.year));
      const oldNum = this.yearBox.querySelector(".neto-year-num");
      this.yearBox.append(num);
      if (animate) {
        gsap.fromTo(num, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: "expo.out" });
        if (oldNum)
          gsap.to(oldNum, {
            yPercent: -100,
            duration: 0.9,
            ease: "expo.out",
            onComplete: () => oldNum.remove(),
          });
      } else oldNum?.remove();
    }

    // Título do marco e a data.
    const block = h(
      "div",
      { class: "neto-block" },
      h("p", { class: "neto-title" }, item.title),
      h("p", { class: "neto-date" }, item.date),
    );
    const oldBlock = this.textBox.querySelector(".neto-block");
    this.textBox.append(block);
    if (animate) {
      gsap.fromTo(
        block,
        { y: 34, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.15, ease: "power3.out" },
      );
      if (oldBlock)
        gsap.to(oldBlock, {
          y: -24,
          opacity: 0,
          duration: 0.4,
          onComplete: () => oldBlock.remove(),
        });
    } else oldBlock?.remove();

    this.credit.textContent = `Foto: ${item.photo.credit}`;
  }

  /** Leva o carro até o cone do marco e acende o cone. */
  private driveTo(i: number) {
    const target = this.coneX(i);
    const from = this.carX;
    const state = { x: from };
    gsap.to(state, {
      x: target,
      duration: i === 0 ? 1.4 : 1.7,
      ease: "power2.inOut",
      onUpdate: () => {
        const progress = (state.x - from) / Math.max(1, target - from);
        const drift = Math.sin(Math.PI * Math.min(1, Math.max(0, progress))) * 22;
        this.carX = state.x;
        this.car.place(state.x, LANE_Y + drift * 0.6, -90 + drift);
        this.car.smoke(0.5, 90);
      },
      onComplete: () => {
        const cone = this.cones[i];
        if (!cone) return;
        gsap.to(cone, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          cone.querySelector(".cone-ring"),
          { opacity: 0.95, scale: 0.5 },
          { opacity: 0, scale: 1.9, duration: 0.9, ease: "power2.out", transformOrigin: "50% 50%" },
        );
      },
    });
  }

  /** Depois do último marco, o carro sai pela direita e volta pela esquerda. */
  private loopBack() {
    const state = { x: this.carX };
    gsap.to(state, {
      x: 2050,
      duration: 0.9,
      ease: "power2.in",
      onUpdate: () => {
        this.carX = state.x;
        this.car.place(state.x, LANE_Y, -90);
      },
      onComplete: () => {
        this.cones.forEach((cone) => gsap.to(cone, { opacity: 0.4, duration: 0.4 }));
        this.carX = -120;
        this.driveTo(0);
      },
    });
  }
}
