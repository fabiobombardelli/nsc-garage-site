import "./s09-resultado.css";
import p16 from "../../assets/print-16-painel-agenda.webp";
import p18 from "../../assets/print-18-painel-acessibilidade.webp";
import p20 from "../../assets/print-20-alto-contraste-agendar.webp";
import p21 from "../../assets/print-21-fonte-150.webp";
import { h } from "../../dom";
import { countTo } from "../lib/car2d";
import { Scene } from "../scene";

const PHOTOS = [
  { src: p16, x: 90, y: 90, r: -7, from: [-900, -200] },
  { src: p18, x: 1230, y: 70, r: 6, from: [900, -260] },
  { src: p20, x: 140, y: 650, r: 5, from: [-900, 300] },
  { src: p21, x: 1210, y: 640, r: -5, from: [900, 280] },
] as const;

/** Resultado: os números (todos documentados) com as telas espalhadas na bancada. */
export class ResultadoScene extends Scene {
  readonly steps = 1;

  constructor() {
    super("scene-resultado");
  }

  protected build() {
    const photos = PHOTOS.map((photo) =>
      h(
        "div",
        {
          class: "res-photo",
          style: `left:${photo.x}px;top:${photo.y}px;--r:${photo.r}deg`,
        },
        h("img", { src: photo.src, alt: "" }),
      ),
    );
    const zero = h("span", { class: "res-num t-head" }, "0");
    const tests = h("span", { class: "res-num t-head" }, "0/77");
    const screens = h("span", { class: "res-num t-head" }, "0");
    const stat = (num: HTMLElement, label: string) =>
      h("div", { class: "res-stat" }, num, h("p", { class: "res-label t-label" }, label));
    const band = h(
      "div",
      { class: "res-band" },
      h(
        "div",
        { class: "res-stats" },
        stat(zero, "violações de acessibilidade"),
        stat(tests, "testes passando"),
        stat(screens, "telas"),
      ),
      h("p", { class: "res-live t-lead" }, "No ar desde 5/11/2026 · nsc.vox.dev.br"),
    );
    this.el.append(...photos, band);

    photos.forEach((photo, i) => {
      const [fx, fy] = PHOTOS[i]?.from ?? [0, 0];
      this.tl.fromTo(
        photo,
        { x: fx, y: fy, rotation: (PHOTOS[i]?.r ?? 0) * 3, opacity: 0 },
        { x: 0, y: 0, rotation: PHOTOS[i]?.r ?? 0, opacity: 1, duration: 0.9, ease: "power3.out" },
        i * 0.12,
      );
    });
    this.tl
      .fromTo(band, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "expo.out" }, 0.5)
      .fromTo(
        zero,
        { y: -90, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "bounce.out" },
        1,
      )
      .add(
        countTo(tests, 77, 1.6, (n) => `${n}/77`),
        1.1,
      )
      .add(countTo(screens, 6, 1.2), 1.2)
      .fromTo(
        this.q(".res-label"),
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12 },
        1.4,
      )
      .fromTo(this.q(".res-live"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 2.2);
    this.mark();
  }
}
