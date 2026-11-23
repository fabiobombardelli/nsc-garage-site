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

  /**
   * Roda a animação e resolve no fim. Trava de segurança: se o navegador
   * parar de desenhar (aba em segundo plano, janela encoberta), a animação
   * congela; depois de 1,5 s ela é concluída à força e a apresentação continua
   * obedecendo aos celulares.
   */
  const run = (tween: () => gsap.core.Tween, end: number) =>
    new Promise<void>((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(guard);
        animation.kill();
        gsap.set(el, { xPercent: end });
        resolve();
      };
      const animation = tween().eventCallback("onComplete", finish);
      const guard = window.setTimeout(finish, 1500);
    });

  return {
    cover: () =>
      run(
        () =>
          gsap.fromTo(el, { xPercent: -101 }, { xPercent: 0, duration: 0.34, ease: "power3.in" }),
        0,
      ),
    reveal: () =>
      run(() => gsap.to(el, { xPercent: 101, duration: 0.42, ease: "power3.out" }), -101),
  };
}
