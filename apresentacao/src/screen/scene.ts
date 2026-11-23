import gsap from "gsap";
import type { GL, World } from "./gl";

export type SceneContext = {
  gl: GL;
  sala: string;
  /** Endereço que o celular abre para virar apresentador. */
  presenterUrl: string;
  /** Nomes de quem está conectado como apresentador (lobby). */
  presenters: () => string[];
  onPresenters: (callback: (nomes: string[]) => void) => () => void;
};

/**
 * Uma cena da apresentação.
 *
 * O DOM e o timeline são montados em `build()`. O timeline tem um rótulo
 * `p0`, `p1`… no fim de cada passo: mostrar o passo k é levar a agulha até
 * `pk` (animando quando avança um passo, saltando quando volta ou pula).
 * Movimentos contínuos (carro, fumaça, fotos) ficam fora do timeline e são
 * ligados em `onStep`, desligados em `unmount`.
 */
export abstract class Scene {
  abstract readonly steps: number;
  readonly el: HTMLElement;
  /** Mundo 3D da cena, quando houver (renderizado pelo GL compartilhado). */
  world: World | null = null;
  protected tl = gsap.timeline({ paused: true });
  protected ctx!: SceneContext;
  private playhead: gsap.core.Tween | null = null;
  private cleanups: (() => void)[] = [];
  private label = 0;

  constructor(className: string) {
    this.el = document.createElement("section");
    this.el.className = `scene ${className}`;
  }

  mount(ctx: SceneContext) {
    this.ctx = ctx;
    this.build();
  }

  protected abstract build(): void;

  /** Elementos desta cena (nunca de outra montada ao mesmo tempo). */
  protected q(selector: string): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>(selector));
  }

  /** Fecha o passo atual no timeline (chame depois das animações de cada passo). */
  protected mark() {
    this.tl.addLabel(`p${this.label}`);
    this.label += 1;
  }

  show(step: number, animate: boolean) {
    this.playhead?.kill();
    const label = `p${step}`;
    if (animate) this.playhead = this.tl.tweenTo(label);
    // false: dispara os onUpdate (carro na pista, contadores, luzes) também no salto.
    else this.tl.seek(label, false);
    this.onStep(step, animate);
  }

  /** A animação do passo atual já terminou. */
  get settled() {
    return !this.playhead || !this.playhead.isActive();
  }

  /** Liga ou ajusta movimentos contínuos do passo. */
  protected onStep(_step: number, _animate: boolean) {}

  /** A cena ficou visível (a cortina abriu). */
  activate() {}

  protected onCleanup(fn: () => void) {
    this.cleanups.push(fn);
  }

  unmount() {
    this.playhead?.kill();
    this.tl.kill();
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
    this.world?.dispose();
    this.world = null;
    this.el.remove();
  }
}
