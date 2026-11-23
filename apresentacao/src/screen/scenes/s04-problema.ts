import "./s04-problema.css";
import antigoUrl from "../../assets/antigo-02-desktop-pagina.webp";
import { h, s } from "../../dom";
import { cone2d } from "../lib/car2d";
import { Scene } from "../scene";

/** Onde cada problema aparece no print do site antigo (px do palco). */
const PROBLEMS = [
  { spot: [178, 123], label: "Sem cadeado" },
  { spot: [682, 160], label: "WhatsApp falso" },
  { spot: [450, 380], label: "Imagens sem descrição" },
  { spot: [450, 794], label: "Texto genérico" },
] as const;
const ROW_Y = [300, 470, 640, 810];
const LABEL_X = 950;

const lockIcon = () =>
  s(
    "svg",
    { class: "prob-lock", width: 26, height: 26, viewBox: "0 0 24 24", "aria-hidden": "true" },
    s("rect", {
      x: 4,
      y: 11,
      width: 16,
      height: 10,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
    }),
    s("path", {
      d: "M8 11V7a4 4 0 0 1 7.6-1.8",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": 2,
    }),
  );

/** O problema: o site antigo, os problemas marcados por cones e o que faltava. */
export class ProblemaScene extends Scene {
  readonly steps = 2;

  constructor() {
    super("scene-problema");
  }

  protected build() {
    const frame = h(
      "div",
      { class: "prob-frame" },
      h(
        "div",
        { class: "prob-bar" },
        lockIcon(),
        h("span", { class: "prob-url" }, "http://nscgarage.com.br"),
        h("span", { class: "prob-unsafe" }, "Não seguro"),
      ),
      h(
        "div",
        { class: "prob-shot" },
        h("img", { src: antigoUrl, alt: "Site anterior da NSC Garage", width: 600, height: 834 }),
      ),
    );

    const lines = s("svg", {
      class: "prob-lines",
      width: 1920,
      height: 1080,
      viewBox: "0 0 1920 1080",
      "aria-hidden": "true",
    });
    const pins: HTMLElement[] = [];
    const labels: HTMLElement[] = [];
    const paths: SVGPathElement[] = [];
    PROBLEMS.forEach((problem, i) => {
      const [x, y] = problem.spot;
      const rowY = ROW_Y[i] ?? 0;
      const d = `M${x} ${y} L${x + 60} ${y} L${LABEL_X - 90} ${rowY}`;
      const path = s("path", { d, class: "prob-line" });
      lines.append(path);
      paths.push(path);
      const pin = h(
        "div",
        { class: "prob-pin", style: `left:${x}px;top:${y}px` },
        s(
          "svg",
          { width: 64, height: 64, viewBox: "-20 -20 40 40", "aria-hidden": "true" },
          cone2d(0, 0, 1),
        ),
      );
      pins.push(pin);
      const label = h(
        "div",
        { class: "prob-label", style: `left:${LABEL_X}px;top:${rowY}px` },
        s(
          "svg",
          { width: 70, height: 70, viewBox: "-20 -20 40 40", "aria-hidden": "true" },
          cone2d(0, 0, 1),
        ),
        h("span", { class: "t-head" }, problem.label),
      );
      labels.push(label);
    });

    const kicker = h("p", { class: "prob-kicker t-placa" }, "O site antes");
    const missing = h(
      "div",
      { class: "prob-missing" },
      ...["Sem história", "Sem agendamento", "Sem acessibilidade"].map((text) =>
        h("p", { class: "prob-plate lacquer t-head" }, text),
      ),
    );
    const before = h("div", { class: "prob-before" }, frame, lines, ...pins, ...labels, kicker);
    this.el.append(before, missing);

    // Passo 1: o print entra e os cones caem sobre cada problema.
    this.tl
      .from(frame, { x: -120, opacity: 0, duration: 0.9, ease: "expo.out" }, 0)
      .from(kicker, { y: 30, opacity: 0, duration: 0.6 }, 0.3);
    paths.forEach((path, i) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      const at = 0.9 + i * 0.85;
      this.tl
        .from(pins[i] ?? [], { y: -220, opacity: 0, duration: 0.7, ease: "bounce.out" }, at)
        .fromTo(
          path,
          { strokeDashoffset: length },
          { strokeDashoffset: 0, duration: 0.45, ease: "power2.out" },
          at + 0.45,
        )
        .from(labels[i] ?? [], { x: 50, opacity: 0, duration: 0.5, ease: "power3.out" }, at + 0.6);
    });
    this.mark();

    // Passo 2: o site antigo sai como um carro deixando o box; entram as placas.
    this.tl
      .to(before, { x: -2300, rotation: -4, opacity: 0, duration: 0.8, ease: "power3.in" })
      .from(
        this.q(".prob-plate"),
        { y: -50, opacity: 0, duration: 0.6, stagger: 0.25, ease: "power3.out" },
        "-=0.1",
      );
    this.mark();
  }
}
