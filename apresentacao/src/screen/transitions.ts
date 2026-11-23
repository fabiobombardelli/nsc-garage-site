import gsap from "gsap";
import { h } from "../dom";

export type Curtain = {
  cover(): Promise<void>;
  reveal(): Promise<void>;
};

/**
 * "Cortina de laca": um painel vermelho varre o palco, a cena troca por
 * trás dele e o painel sai pelo outro lado (cerca de 0,7 s no total).
 */
export function createCurtain(layer: HTMLElement): Curtain {
  const el = h(
    "div",
    { class: "curtain", "aria-hidden": "true" },
    h("span", { class: "curtain-edge" }),
  );
  layer.append(el);
  gsap.set(el, { xPercent: -101 });

  return {
    cover: () =>
      new Promise((resolve) => {
        gsap.fromTo(
          el,
          { xPercent: -101 },
          { xPercent: 0, duration: 0.34, ease: "power3.in", onComplete: () => resolve() },
        );
      }),
    reveal: () =>
      new Promise((resolve) => {
        gsap.to(el, {
          xPercent: 101,
          duration: 0.42,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(el, { xPercent: -101 });
            resolve();
          },
        });
      }),
  };
}
