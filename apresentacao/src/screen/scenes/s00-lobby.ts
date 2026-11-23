import "./s00-lobby.css";
import logoUrl from "@site/assets/brand/logo.webp";
import { h } from "../../dom";
import { qrSvg } from "../qr";
import { Scene } from "../scene";

/**
 * Lobby: antes de começar. O QR leva o celular de cada integrante para a
 * versão do apresentador; a lista mostra quem já está conectado.
 */
export class LobbyScene extends Scene {
  readonly steps = 1;

  constructor() {
    super("scene-lobby");
  }

  protected build() {
    const qr = h("div", { class: "lobby-qr" });
    void qrSvg(this.ctx.presenterUrl).then((svg) => (qr.innerHTML = svg));
    const names = h("ul", { class: "lobby-names" });
    const renderNames = (list: string[]) => {
      const unique = [...new Set(list)];
      names.replaceChildren(
        ...(unique.length
          ? unique.map((nome) => h("li", { class: "lobby-name" }, nome))
          : [h("li", { class: "lobby-name is-empty" }, "Ninguém conectado ainda")]),
      );
    };
    renderNames(this.ctx.presenters());
    this.onCleanup(this.ctx.onPresenters(renderNames));

    const leds = h(
      "div",
      { class: "lobby-leds", "aria-hidden": "true" },
      h("span", { class: "lobby-led" }),
      h("span", { class: "lobby-led" }),
      h("span", { class: "lobby-led" }),
    );
    const left = h(
      "div",
      { class: "lobby-left" },
      h("img", { class: "lobby-logo", src: logoUrl, alt: "NSC Garage", width: 520 }),
      h("p", { class: "lobby-kicker t-placa" }, "Projeto de extensão · Fatec Rubens Lara"),
      h("h1", { class: "lobby-title t-head" }, "Site e agendamento acessível"),
      h("p", { class: "lobby-hint t-small muted" }, "→ para começar"),
    );
    const right = h(
      "div",
      { class: "lobby-right" },
      qr,
      h("p", { class: "lobby-label t-placa" }, "Celular do apresentador"),
      h("p", { class: "lobby-code t-head" }, this.ctx.sala),
      names,
    );
    this.el.append(leds, left, right);

    this.tl
      .from(this.q(".lobby-led"), { opacity: 0, duration: 0.5, stagger: 0.18 }, 0)
      .from(
        left.children,
        { y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.out" },
        0.2,
      )
      .from(right, { x: 60, opacity: 0, duration: 0.9, ease: "expo.out" }, 0.4);
    this.mark();
  }
}
