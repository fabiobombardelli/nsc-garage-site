import type { GL } from "./gl";
import type { Scene, SceneContext } from "./scene";
import type { Curtain } from "./transitions";

export type SceneFactory = () => Scene;

export type DirectorState = {
  scene: number;
  step: number;
  /** Milissegundos desde o início (cena 1), ou null no lobby antes de começar. */
  elapsed: number | null;
  /** Milissegundos desde que a cena atual entrou. */
  sceneElapsed: number;
};

type Mounted = { index: number; scene: Scene };

/**
 * O diretor: guarda em que cena e passo a apresentação está, troca as cenas
 * com a cortina e deixa a próxima cena montada (escondida) para não engasgar.
 */
export class Director {
  private current: Mounted | null = null;
  private upcoming: Mounted | null = null;
  private step = 0;
  private busy = false;
  private pending: (() => void) | null = null;
  private startedAt: number | null = null;
  private sceneStartedAt = Date.now();
  private listeners: ((state: DirectorState) => void)[] = [];

  constructor(
    private readonly factories: readonly SceneFactory[],
    private readonly layer: HTMLElement,
    private readonly ctx: SceneContext,
    private readonly curtain: Curtain,
    private readonly gl: GL,
  ) {}

  get state(): DirectorState {
    return {
      scene: this.current?.index ?? 0,
      step: this.step,
      elapsed: this.startedAt === null ? null : Date.now() - this.startedAt,
      sceneElapsed: Date.now() - this.sceneStartedAt,
    };
  }

  get sceneCount() {
    return this.factories.length;
  }

  /** Sem cortina em andamento e com a animação do passo terminada. */
  get settled() {
    return !this.busy && Boolean(this.current?.scene.settled);
  }

  onChange(listener: (state: DirectorState) => void) {
    this.listeners.push(listener);
  }

  resetTimer() {
    this.startedAt = this.current && this.current.index > 0 ? Date.now() : null;
    this.emit();
  }

  start(index: number, step = 0) {
    const target = this.clamp(index);
    const mounted = this.create(target);
    this.reveal(mounted);
    this.enter(mounted, Math.min(step, mounted.scene.steps - 1), true);
  }

  next() {
    this.run(() => {
      const current = this.current;
      if (!current) return;
      if (this.step < current.scene.steps - 1) {
        this.step += 1;
        current.scene.show(this.step, true);
        this.emit();
      } else if (current.index < this.factories.length - 1) {
        return this.transition(current.index + 1, 0, true);
      }
    });
  }

  prev() {
    this.run(() => {
      const current = this.current;
      if (!current) return;
      if (this.step > 0) {
        this.step -= 1;
        current.scene.show(this.step, false);
        this.emit();
      } else if (current.index > 0) {
        return this.transition(current.index - 1, Number.POSITIVE_INFINITY, false);
      }
    });
  }

  goTo(index: number, step = 0) {
    this.run(() => {
      const target = this.clamp(index);
      const current = this.current;
      if (current && current.index === target) {
        this.step = Math.min(Math.max(0, step), current.scene.steps - 1);
        current.scene.show(this.step, false);
        this.emit();
        return;
      }
      return this.transition(target, step, step === 0);
    });
  }

  /** Executa um comando; durante a cortina guarda só o último pedido. */
  private run(command: () => Promise<void> | void) {
    if (this.busy) {
      this.pending = command;
      return;
    }
    const result = command();
    if (result instanceof Promise) {
      this.busy = true;
      void result.finally(() => {
        this.busy = false;
        const pending = this.pending;
        this.pending = null;
        if (pending) this.run(pending);
      });
    }
  }

  private async transition(index: number, step: number, animate: boolean) {
    const target = this.clamp(index);
    const mounted =
      this.upcoming && this.upcoming.index === target ? this.upcoming : this.create(target);
    if (this.upcoming && this.upcoming !== mounted) this.upcoming.scene.unmount();
    this.upcoming = null;

    await this.curtain.cover();
    this.current?.scene.unmount();
    this.reveal(mounted);
    this.enter(mounted, Math.min(step, mounted.scene.steps - 1), animate);
    await this.curtain.reveal();
  }

  private enter(mounted: Mounted, step: number, animate: boolean) {
    this.current = mounted;
    this.step = Math.max(0, step);
    this.sceneStartedAt = Date.now();
    if (mounted.index === 0) this.startedAt = null;
    else if (this.startedAt === null) this.startedAt = Date.now();
    this.gl.setWorld(mounted.scene.world);
    mounted.scene.activate();
    mounted.scene.show(this.step, animate);
    this.emit();
    this.premount(mounted.index + 1);
  }

  private create(index: number): Mounted {
    const factory = this.factories[index];
    if (!factory) throw new Error(`Cena ${index} não existe`);
    const scene = factory();
    scene.el.classList.add("is-hidden");
    this.layer.append(scene.el);
    scene.mount(this.ctx);
    return { index, scene };
  }

  private reveal(mounted: Mounted) {
    mounted.scene.el.classList.remove("is-hidden");
  }

  private premount(index: number) {
    if (index >= this.factories.length) return;
    if (this.upcoming?.index === index) return;
    this.upcoming?.scene.unmount();
    this.upcoming = null;
    // Monta na próxima pausa do navegador, depois da cena atual já ter aparecido.
    window.setTimeout(() => {
      if (this.current?.index !== index - 1 || this.upcoming) return;
      this.upcoming = this.create(index);
      const world = this.upcoming.scene.world;
      if (world) this.gl.prepare(world);
    }, 900);
  }

  private clamp(index: number) {
    return Math.min(this.factories.length - 1, Math.max(0, Math.round(index)));
  }

  private emit() {
    const state = this.state;
    this.listeners.forEach((listener) => listener(state));
  }
}
