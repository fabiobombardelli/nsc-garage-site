import "./s08-acessibilidade.css";
import gsap from "gsap";
import { h, s } from "../../dom";
import { Car2D } from "../lib/car2d";
import { Scene } from "../scene";

/** Os tokens do site em hexadecimal, para o GSAP interpolar (normal e alto contraste). */
const NORMAL = {
  "--m-bg": "#151719",
  "--m-raised": "#2d2f32",
  "--m-ink": "#f2f4f5",
  "--m-muted": "#b4b8bb",
  "--m-accent": "#d01d21",
  "--m-on-accent": "#f9fafb",
  "--m-edge": "#83868a",
};
const HIGH = {
  "--m-bg": "#000000",
  "--m-raised": "#000000",
  "--m-ink": "#ffffff",
  "--m-muted": "#ffffff",
  "--m-accent": "#d40000",
  "--m-on-accent": "#ffffff",
  "--m-edge": "#ffffff",
};
const KEY_IDLE = { backgroundColor: "#2d2f32", color: "#f2f4f5", y: 0 };
const KEY_DOWN = { backgroundColor: "#f2f4f5", color: "#151719", y: 5 };
const SERVICES = [
  "Preparação para drift",
  "Preparação de motor",
  "Suspensão e geometria",
  "Telemetria e acerto",
];
const LANE_Y = 45;

/**
 * Acessibilidade: a mesma mini tela do agendamento usada pelo teclado, com
 * alto contraste e texto em 150% (mesmos componentes, outras variáveis), o
 * leitor de tela anunciando a etapa e o movimento que para.
 */
export class AcessibilidadeScene extends Scene {
  readonly steps = 3;
  private shuttle: gsap.core.Timeline | null = null;

  constructor() {
    super("scene-acess");
  }

  protected build() {
    // ---------- Mini tela ----------
    const swap = (cls: string, a: string, b: string) =>
      h(
        "p",
        { class: `ac-swap ${cls}` },
        h("span", { class: "ac-a" }, a),
        h("span", { class: "ac-b" }, b),
      );
    const options = SERVICES.map((name) =>
      h(
        "div",
        { class: "ac-opt" },
        h("span", { class: "ac-box" }, h("span", { class: "ac-check" }, "✓")),
        h("span", { class: "ac-opt-name" }, name),
        h("span", { class: "ac-sel", "aria-hidden": "true" }),
      ),
    );
    const button = h("span", { class: "ac-btn" }, "Continuar");
    const ring = h("span", { class: "ac-ring", "aria-hidden": "true" });
    const mini = h(
      "div",
      { class: "ac-mini" },
      swap("ac-step", "Etapa 1 de 4", "Etapa 2 de 4"),
      swap("ac-title", "Qual é o serviço?", "Quando você traz o carro?"),
      h("div", { class: "ac-grid" }, ...options),
      h("div", { class: "ac-actions" }, button),
      ring,
    );
    gsap.set(mini, { ...NORMAL, "--k": 1 });

    // ---------- Teclas ----------
    const key = (label: string, wide = false) =>
      h("span", { class: `ac-key${wide ? " is-wide" : ""}` }, label);
    const tab = key("Tab", true);
    const left = key("←");
    const right = key("→");
    const space = key("Espaço", true);
    const enter = key("Enter", true);
    const keys = h("div", { class: "ac-keys" }, tab, left, right, space, enter);

    // ---------- Painel de acessibilidade ----------
    const chips = ["100%", "112%", "125%", "150%"].map((label) =>
      h("span", { class: "ac-chip" }, label),
    );
    const chipSel = h("span", { class: "ac-chip-sel", "aria-hidden": "true" });
    const toggle = (label: string) => {
      const knob = h("span", { class: "ac-knob" });
      const track = h("span", { class: "ac-track" }, knob);
      return {
        row: h("div", { class: "ac-row" }, h("span", { class: "ac-row-label" }, label), track),
        knob,
        track,
      };
    };
    const contrast = toggle("Alto contraste");
    const motion = toggle("Reduzir movimento");
    const panel = h(
      "div",
      { class: "ac-panel" },
      h("p", { class: "ac-panel-title t-placa" }, "Acessibilidade"),
      h("p", { class: "ac-row-label" }, "Tamanho do texto"),
      h("div", { class: "ac-chips" }, chipSel, ...chips),
      contrast.row,
      motion.row,
    );

    // ---------- Leitor de tela ----------
    const bubble = h(
      "div",
      { class: "ac-bubble light-panel" },
      s(
        "svg",
        { width: 56, height: 56, viewBox: "0 0 24 24", "aria-hidden": "true", class: "ac-speaker" },
        s("path", { d: "M4 9h4l5-4v14l-5-4H4z", fill: "currentColor" }),
        s("path", {
          d: "M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": 2,
        }),
      ),
      h("p", { class: "ac-bubble-text" }, "“Etapa 2 de 4: Quando você traz o carro?”"),
    );

    // ---------- Selo e pista ----------
    const badge = h("p", { class: "ac-badge lacquer t-placa" }, "WCAG 2.2 AA · eMAG · LBI");
    const laneCars = h("div", { class: "ac-lane-cars" });
    const lane = h(
      "div",
      { class: "ac-lane" },
      s(
        "svg",
        { width: 1920, height: 90, viewBox: "0 0 1920 90", "aria-hidden": "true" },
        s("rect", { x: 0, y: 12, width: 1920, height: 66, fill: "var(--color-asphalt)" }),
        s("line", {
          x1: 0,
          y1: LANE_Y,
          x2: 1920,
          y2: LANE_Y,
          stroke: "var(--color-paint)",
          "stroke-width": 3,
          "stroke-dasharray": "20 24",
          opacity: 0.4,
        }),
      ),
      laneCars,
    );
    this.el.append(mini, keys, panel, bubble, badge, lane);

    // Carro indo e voltando (para quando "Reduzir movimento" liga).
    const car = new Car2D(laneCars, 34);
    const pos = { x: 160, r: -90 };
    const placeCar = () => {
      car.place(pos.x, LANE_Y, pos.r);
      if ((this.shuttle?.timeScale() ?? 0) > 0.3) car.smoke(0.4, 140);
    };
    placeCar();
    this.shuttle = gsap
      .timeline({ repeat: -1, paused: true, onUpdate: placeCar })
      .to(pos, { x: 1760, duration: 3.2, ease: "power1.inOut" })
      .to(pos, { r: 90, duration: 0.5, ease: "power2.inOut" })
      .to(pos, { x: 160, duration: 3.2, ease: "power1.inOut" })
      .to(pos, { r: 270, duration: 0.5, ease: "power2.inOut" })
      .set(pos, { r: -90 });
    this.onCleanup(() => this.shuttle?.kill());

    // ---------- Linha do tempo ----------
    const ringTo = (el: HTMLElement, at?: gsap.Position) =>
      this.tl.to(
        ring,
        {
          x: () => el.offsetLeft - 8,
          y: () => el.offsetTop - 8,
          width: () => el.offsetWidth + 16,
          height: () => el.offsetHeight + 16,
          duration: 0.35,
          ease: "power3.out",
        },
        at,
      );
    const press = (k: HTMLElement) =>
      this.tl.to(k, { ...KEY_DOWN, duration: 0.12 }).to(k, { ...KEY_IDLE, duration: 0.3 }, "+=0.2");
    const opt0 = options[0] as HTMLElement;
    const opt1 = options[1] as HTMLElement;

    gsap.set([bubble, ring], { opacity: 0 });
    gsap.set(this.q(".ac-b"), { opacity: 0 });
    gsap.set(this.q(".ac-check, .ac-sel"), { opacity: 0 });

    // Passo 1: teclado.
    this.tl
      .fromTo(mini, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" }, 0)
      .fromTo(
        panel,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.7, ease: "expo.out" },
        0.15,
      )
      .fromTo(badge, { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.3)
      .fromTo(keys, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.45);
    press(tab);
    ringTo(opt0, "<");
    this.tl.to(ring, { opacity: 1, duration: 0.15 }, "<");
    press(right);
    ringTo(opt1, "<");
    this.tl.to(opt1.querySelectorAll(".ac-check, .ac-sel"), { opacity: 1, duration: 0.2 }, "<");
    press(tab);
    ringTo(button, "<");
    press(enter);
    this.tl.to(button, { scale: 0.94, duration: 0.1, yoyo: true, repeat: 1 }, "<");
    this.mark();

    // Passo 2: alto contraste e texto em 150%.
    this.tl
      .to([keys, ring], { opacity: 0, duration: 0.3 })
      .to(contrast.knob, { x: 40, duration: 0.3, ease: "power2.out" })
      .to(contrast.track, { backgroundColor: "#f2f4f5", duration: 0.3 }, "<")
      .to(mini, { ...HIGH, duration: 0.6 }, "<")
      .to(
        chipSel,
        {
          x: () => (chips[3]?.offsetLeft ?? 0) - (chips[0]?.offsetLeft ?? 0),
          duration: 0.6,
          ease: "power3.inOut",
        },
        "+=0.3",
      )
      .to(mini, { "--k": 1.5, duration: 1.2, ease: "power2.inOut" }, "<");
    this.mark();

    // Passo 3: leitor de tela e movimento reduzido.
    this.tl
      .to(mini, { ...NORMAL, "--k": 1, duration: 0.6, ease: "power2.inOut" })
      .to(contrast.knob, { x: 0, duration: 0.3 }, "<")
      .to(contrast.track, { backgroundColor: "#2d2f32", duration: 0.3 }, "<")
      .to(chipSel, { x: 0, duration: 0.5, ease: "power3.inOut" }, "<")
      .to(this.q(".ac-a"), { opacity: 0, duration: 0.3 })
      .to(this.q(".ac-b"), { opacity: 1, duration: 0.3 }, "<0.1")
      .fromTo(
        bubble,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.8)" },
      )
      .to(motion.knob, { x: 40, duration: 0.3, ease: "power2.out" }, "+=0.4")
      .to(motion.track, { backgroundColor: "#f2f4f5", duration: 0.3 }, "<");
    this.mark();
  }

  activate() {
    this.shuttle?.play();
  }

  protected onStep(step: number) {
    if (!this.shuttle) return;
    if (step === 2)
      gsap.to(this.shuttle, { timeScale: 0, duration: 1.2, delay: 1.6, ease: "power2.out" });
    else {
      gsap.killTweensOf(this.shuttle);
      this.shuttle.timeScale(1);
    }
  }
}
