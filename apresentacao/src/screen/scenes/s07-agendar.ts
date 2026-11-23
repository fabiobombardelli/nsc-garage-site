import "./s07-agendar.css";
import gsap from "gsap";
import { buildTrackPath, getCarPoseAtLength, lengthAt } from "@site/lib/track";
import p09 from "../../assets/print-09-agendar-servico.webp";
import p11 from "../../assets/print-11-agendar-dia-horario.webp";
import p12 from "../../assets/print-12-agendar-dados-erros.webp";
import p13 from "../../assets/print-13-agendar-revisao.webp";
import p14 from "../../assets/print-14-comprovante.webp";
import { h, s } from "../../dom";
import { Car2D, cone2d, donut, driveTween, lightCone } from "../lib/car2d";
import { Scene } from "../scene";

/** Ápices da pista em S (px do piso, 1000×1000). O primeiro ponto fica fora do piso. */
const POINTS = [
  { x: 520, y: -90 },
  { x: 800, y: 170 },
  { x: 220, y: 420 },
  { x: 800, y: 670 },
  { x: 240, y: 900 },
];
const LEGS = [
  { title: "1 · Serviço", label: "Serviço", shot: p09 },
  { title: "2 · Data e hora", label: "Data e hora", shot: p11 },
  { title: "3 · Seus dados", label: "Seus dados", shot: p12 },
  { title: "4 · Revisão", label: "Revisão", shot: p13 },
];
const CONE_OFFSET = 120;

/** Agendar em 4 curvas: o carro vai de cone em cone e, no fim, comemora com zerinho. */
export class AgendarScene extends Scene {
  readonly steps = 2;
  private car!: Car2D;
  private path!: SVGPathElement;
  private stopDonut: (() => void) | null = null;
  private lastApex = { x: 0, y: 0, d: 0 };
  private cones: { x: number; y: number }[] = [];

  constructor() {
    super("scene-agendar");
  }

  protected build() {
    const d = buildTrackPath(POINTS);
    this.path = s("path", { d, class: "ag-center" });
    const marks = s("path", { d, class: "ag-marks" });
    const svg = s(
      "svg",
      {
        class: "ag-svg",
        width: 1000,
        height: 1000,
        viewBox: "0 0 1000 1000",
        "aria-hidden": "true",
      },
      s("path", { d, class: "ag-edge" }),
      s("path", { d, class: "ag-asphalt" }),
      s("path", { d, class: "ag-dash" }),
      this.path,
    );
    // A marca de pneu muda a cada quadro: camada própria, para não redesenhar a pista inteira.
    const marksSvg = s(
      "svg",
      {
        class: "ag-svg ag-marks-layer",
        width: 1000,
        height: 1000,
        viewBox: "0 0 1000 1000",
        "aria-hidden": "true",
      },
      marks,
    );
    const floor = h("div", { class: "ag-floor" }, svg, marksSvg);
    this.el.append(floor);

    const total = this.path.getTotalLength();
    marks.style.strokeDasharray = `${total}`;
    marks.style.strokeDashoffset = `${total}`;

    // Cones e rótulos ao lado de cada ápice.
    const apexes = POINTS.slice(1).map((point) => ({
      ...point,
      d: lengthAt(this.path, "y", point.y, total),
    }));
    const coneEls = apexes.map((apex, i) => {
      const right = apex.x > 500;
      const cx = apex.x + (right ? CONE_OFFSET : -CONE_OFFSET);
      this.cones.push({ x: cx, y: apex.y });
      const cone = cone2d(cx, apex.y, 2.1);
      cone.style.opacity = "0.45";
      svg.append(cone);
      const leg = LEGS[i];
      const label = h(
        "p",
        {
          class: `ag-label t-placa ${right ? "is-left" : "is-right"}`,
          style: right
            ? `right:${1000 - apex.x + 110}px;top:${apex.y}px`
            : `left:${apex.x + 110}px;top:${apex.y}px`,
        },
        leg?.label ?? "",
      );
      floor.append(label);
      return { cone, label };
    });

    this.car = new Car2D(floor, 54);
    const start = getCarPoseAtLength(this.path, 0, total);
    this.car.place(start.x, start.y, start.rotation);

    // Coluna da direita: título da etapa e a tela do site.
    const titles = LEGS.map((leg) => h("p", { class: "ag-title t-head" }, leg.title));
    const doneTitle = h("p", { class: "ag-title t-head" }, "Comprovante");
    const shots = [...LEGS.map((leg) => leg.shot), p14].map((src) =>
      h("img", { class: "ag-shot", src, alt: "" }),
    );
    const frame = h(
      "div",
      { class: "ag-frame" },
      h("div", { class: "ag-bar" }, h("span", { class: "ag-url" }, "nsc.vox.dev.br/#/agendar")),
      h("div", { class: "ag-screen" }, ...shots),
    );
    const proto = h(
      "div",
      { class: "ag-proto light-panel" },
      h("p", { class: "ag-proto-label t-placa" }, "Protocolo"),
      h("p", { class: "ag-proto-code t-head" }, "NSC-YWA288"),
      h("p", { class: "ag-proto-sub t-label" }, "horário reservado"),
    );
    this.el.append(h("div", { class: "ag-titles" }, ...titles, doneTitle), frame, proto);
    gsap.set([...titles, doneTitle], { autoAlpha: 0 });
    gsap.set(shots, { clipPath: "inset(0% 100% 0% 0%)" });

    // Passo 1: quatro curvas.
    this.tl.fromTo(
      frame,
      { x: 80, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "expo.out" },
      0,
    );
    let from = 0;
    apexes.forEach((apex, i) => {
      this.tl.add(
        driveTween(this.car, this.path, from, apex.d, i === 0 ? 2.1 : 2.4, {
          onMove: (dist) => (marks.style.strokeDashoffset = `${total - dist}`),
        }),
        i === 0 ? 0.3 : ">",
      );
      const els = coneEls[i];
      if (els) {
        lightCone(els.cone, this.tl, ">-0.15");
        this.tl.fromTo(
          els.label,
          { opacity: 0, x: apex.x > 500 ? 30 : -30 },
          { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" },
          "<",
        );
      }
      const previousTitle = titles[i - 1];
      if (previousTitle) this.tl.to(previousTitle, { autoAlpha: 0, duration: 0.2 }, "<");
      const title = titles[i];
      if (title)
        this.tl.fromTo(
          title,
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.45 },
          "<0.1",
        );
      this.tl.to(
        shots[i] ?? [],
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.inOut" },
        "<",
      );
      this.tl.to({}, { duration: 1.1 });
      from = apex.d;
      this.lastApex = apex;
    });
    this.mark();

    // Passo 2: comprovante.
    this.tl
      .to(titles[3] ?? [], { autoAlpha: 0, duration: 0.2 })
      .fromTo(doneTitle, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.45 })
      .to(
        shots[4] ?? [],
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "power3.inOut" },
        "<",
      )
      .fromTo(
        proto,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "back.out(1.6)" },
        "<0.3",
      );
    this.mark();
    gsap.set(proto, { opacity: 0 });
  }

  protected onStep(step: number) {
    if (step === 1) {
      if (this.stopDonut) return;
      const cone = this.cones[3];
      if (!cone) return;
      this.stopDonut = donut(this.car, cone.x, cone.y, Math.abs(this.lastApex.x - cone.x), {
        speed: 2.6,
        drift: 55,
        start: this.lastApex.x > cone.x ? 0 : Math.PI,
      });
      this.onCleanup(() => this.stopDonut?.());
    } else {
      this.stopDonut?.();
      this.stopDonut = null;
      const pose = getCarPoseAtLength(this.path, this.lastApex.d);
      if (this.tl.time() >= (this.tl.labels.p0 ?? 0)) this.car.place(pose.x, pose.y, pose.rotation);
    }
  }
}
