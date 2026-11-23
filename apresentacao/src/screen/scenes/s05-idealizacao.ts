import "./s05-idealizacao.css";
import gsap from "gsap";
import siteUrl from "../../assets/print-01-inicio.webp";
import wireUrl from "../../assets/wireframe-1-inicio.webp";
import { h, maskLine } from "../../dom";
import { Scene } from "../scene";

const SLATS = 10;
const FRAME_W = 1280;
const FRAME_H = 800;

/** Idealização: as ideias descartadas, a paleta do box, a letra e o wireframe virando site. */
export class IdealizacaoScene extends Scene {
  readonly steps = 4;

  constructor() {
    super("scene-ideia");
  }

  protected build() {
    // ---------- Passo 1: três direções descartadas ----------
    const card = (cls: string, label: string, ...inner: HTMLElement[]) =>
      h(
        "div",
        { class: "idea-card-wrap" },
        h("div", { class: `idea-card ${cls}` }, ...inner),
        h("p", { class: "idea-label t-label" }, label),
        h("p", { class: "idea-stamp lacquer t-placa" }, "Descartado"),
      );
    const lines = (n: number) => Array.from({ length: n }, () => h("span", { class: "idea-line" }));
    const cards = h(
      "div",
      { class: "idea-cards" },
      card("idea-white", "Página branca", h("span", { class: "idea-bar" }), ...lines(4)),
      card("idea-neon", "Preto com neon", h("span", { class: "idea-neon-text" }, "DRIFT")),
      card(
        "idea-ficha",
        "Ficha de julgamento",
        h("span", { class: "idea-ficha-head" }),
        ...Array.from({ length: 4 }, () =>
          h(
            "span",
            { class: "idea-ficha-row" },
            h("span"),
            h("span"),
            h("span", { class: "idea-ficha-score" }),
          ),
        ),
      ),
    );
    const kicker = h("p", { class: "idea-kicker t-placa" }, "Antes do código");

    // ---------- Passo 2: a paleta do box ----------
    const title = h("h2", { class: "idea-title t-head" }, maskLine("O box à noite"));
    const plate = (cls: string, name: string, role: string) =>
      h(
        "div",
        { class: "idea-plate" },
        h("span", { class: "idea-cable", "aria-hidden": "true" }),
        h("div", { class: `idea-swatch ${cls}` }),
        h("p", { class: "idea-plate-name t-placa" }, name),
        h("p", { class: "idea-plate-role t-label muted" }, role),
      );
    const plates = h(
      "div",
      { class: "idea-plates" },
      plate("swatch-floor", "Grafite", "o piso"),
      plate("swatch-led", "Luz de LED", "o texto"),
      plate("swatch-lacquer", "Laca vermelha", "a ação"),
    );

    // ---------- Passo 3: a letra ----------
    const word = h("p", { class: "idea-word" }, "NSC Garage");
    const wordCaption = h(
      "p",
      { class: "idea-word-caption t-lead muted" },
      "letra pintada na parede do box",
    );

    // ---------- Passo 4: do wireframe ao site ----------
    const slats = Array.from({ length: SLATS }, (_, i) =>
      h(
        "div",
        {
          class: "idea-slat",
          style: `left:${(i * FRAME_W) / SLATS}px;width:${FRAME_W / SLATS + 1}px`,
        },
        h("img", {
          src: siteUrl,
          alt: "",
          style: `left:${(-i * FRAME_W) / SLATS}px;width:${FRAME_W}px;height:${FRAME_H}px`,
        }),
      ),
    );
    const chipWire = h("p", { class: "idea-chip lacquer t-placa" }, "Wireframe");
    const chipSite = h("p", { class: "idea-chip lacquer t-placa" }, "Site");
    const frame = h(
      "div",
      { class: "idea-frame" },
      h("img", { class: "idea-wire", src: wireUrl, alt: "Wireframe da página inicial" }),
      ...slats,
      chipWire,
      chipSite,
    );
    const frameCaption = h(
      "p",
      { class: "idea-frame-caption t-label muted" },
      "a ordem dos blocos é a ordem de leitura",
    );

    this.el.append(kicker, cards, title, plates, word, wordCaption, frame, frameCaption);

    const wraps = this.q(".idea-card-wrap");
    const stamps = this.q(".idea-stamp");

    // Passo 1
    this.tl
      .from(kicker, { y: 30, opacity: 0, duration: 0.6 }, 0)
      .from(wraps, { y: 80, opacity: 0, duration: 0.8, stagger: 0.15, ease: "expo.out" }, 0.1)
      .from(
        stamps,
        { scale: 1.8, opacity: 0, duration: 0.45, stagger: 0.35, ease: "back.out(2)" },
        1.1,
      );
    this.mark();

    // Passo 2
    gsap.set([title, plates, word, wordCaption, frame, frameCaption], { autoAlpha: 0 });
    this.tl
      .to(wraps, {
        y: 900,
        rotation: (i: number) => [-16, 12, -9][i] ?? 0,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.in",
      })
      .to(kicker, { opacity: 0, duration: 0.3 }, "<")
      .set(title, { autoAlpha: 1 })
      .from(this.q(".idea-title .mask-inner"), { yPercent: 150, duration: 0.9, ease: "expo.out" })
      .set(plates, { autoAlpha: 1 }, "<")
      .from(
        this.q(".idea-plate"),
        { y: -760, duration: 1.1, stagger: 0.18, ease: "back.out(1.2)" },
        "<0.1",
      )
      .from(
        this.q(".idea-plate"),
        { rotation: 4, duration: 1.4, stagger: 0.18, ease: "elastic.out(1, 0.4)" },
        "<0.6",
      );
    this.mark();

    // Passo 3
    const axes = { w: 125, wg: 300 };
    const applyAxes = () => {
      word.style.fontStretch = `${axes.w}%`;
      word.style.fontWeight = String(Math.round(axes.wg));
    };
    applyAxes();
    this.tl
      .to([title, plates], { autoAlpha: 0, y: -40, duration: 0.5, ease: "power2.in" })
      .set(word, { autoAlpha: 1 })
      .fromTo(word, { opacity: 0 }, { opacity: 1, duration: 0.4 })
      .to(axes, { w: 62, wg: 800, duration: 1.8, ease: "power2.inOut", onUpdate: applyAxes }, "<")
      .set(wordCaption, { autoAlpha: 1 }, "-=0.6")
      .fromTo(wordCaption, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "<");
    this.mark();

    // Passo 4
    this.tl
      .to([word, wordCaption], { autoAlpha: 0, duration: 0.4 })
      .set([frame, frameCaption], { autoAlpha: 1 })
      .set(chipSite, { autoAlpha: 0 })
      .fromTo(frame, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" })
      .fromTo(frameCaption, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "<0.2")
      .fromTo(
        slats,
        { clipPath: "inset(0% 0% 100% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, stagger: 0.07, ease: "power3.inOut" },
        "+=0.6",
      )
      .to(chipWire, { autoAlpha: 0, duration: 0.25 }, "<0.3")
      .to(chipSite, { autoAlpha: 1, duration: 0.25 }, "<0.1");
    this.mark();
  }
}
