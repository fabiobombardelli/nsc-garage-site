import { h } from "../../dom";
import type { Cena } from "../../roteiro";
import { Scene } from "../scene";

/** Cena provisória: título e passos, para testar a navegação. */
export class PlaceholderScene extends Scene {
  readonly steps: number;
  private items: HTMLElement[] = [];

  constructor(private readonly cena: Cena) {
    super("scene-placeholder");
    this.steps = cena.passos.length;
  }

  protected build() {
    this.items = this.cena.passos.map((passo, index) =>
      h("li", { class: "placeholder-step" }, `${index + 1}. ${passo}`),
    );
    this.el.append(
      h("p", { class: "placeholder-number t-placa" }, `Cena ${this.cena.numero}`),
      h("h1", { class: "placeholder-title t-head" }, this.cena.titulo),
      h("ol", { class: "placeholder-steps" }, ...this.items),
    );
    this.items.forEach((item) => {
      this.tl.to(item, { opacity: 1, x: 0, duration: 0.4 });
      this.mark();
    });
  }
}
