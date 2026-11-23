import { h } from "../dom";

export const STAGE_W = 1920;
export const STAGE_H = 1080;

export type Stage = {
  viewport: HTMLElement;
  stage: HTMLElement;
  glLayer: HTMLElement;
  sceneLayer: HTMLElement;
  overlayLayer: HTMLElement;
  /** Escala atual do palco (tela / 1920×1080). */
  readonly scale: number;
  onResize(callback: (scale: number) => void): void;
};

/**
 * Palco fixo de 1920×1080 px, escalado para caber na tela (projetor 16:9 ou
 * 16:10) com faixas de grafite nas sobras. Tudo dentro dele usa px do palco.
 */
export function createStage(app: HTMLElement): Stage {
  const glLayer = h("div", { class: "gl-layer" });
  const sceneLayer = h("div", { class: "scene-layer" });
  const overlayLayer = h("div", { class: "overlay-layer" });
  const stage = h("div", { class: "stage" }, glLayer, sceneLayer, overlayLayer);
  const viewport = h("div", { class: "viewport" }, stage);
  app.append(viewport);

  let scale = 1;
  const listeners: ((scale: number) => void)[] = [];
  const fit = () => {
    scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
    listeners.forEach((listener) => listener(scale));
  };
  window.addEventListener("resize", fit);
  fit();

  return {
    viewport,
    stage,
    glLayer,
    sceneLayer,
    overlayLayer,
    get scale() {
      return scale;
    },
    onResize(callback) {
      listeners.push(callback);
      callback(scale);
    },
  };
}
