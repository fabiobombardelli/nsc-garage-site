import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { setCarEnvironment } from "./lib/three-kit";
import { STAGE_H, STAGE_W, type Stage } from "./stage";

export type Quality = "alta" | "baixa";

/** Um mundo 3D de cena: o GL compartilhado só desenha o mundo ativo. */
export interface World {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  bloom?: { strength: number; radius: number; threshold: number };
  /** Intensidade do reflexo de ambiente (pintura com verniz do carro). */
  environment?: number;
  update(dt: number, time: number): void;
  /** Desenhos na GPU antes do quadro (marcas de pneu). */
  beforeRender?(renderer: THREE.WebGLRenderer): void;
  setQuality?(quality: Quality): void;
  dispose(): void;
}

/**
 * Um único WebGLRenderer para todas as cenas 3D (abertura, criação e
 * encerramento), num canvas atrás da camada de DOM do palco. Só desenha
 * quando há um mundo ativo. Qualidade baixa (tecla Q): sem bloom e com
 * menos pixels, para notebooks fracos no projetor.
 */
export class GL {
  readonly canvas: HTMLCanvasElement;
  quality: Quality = "alta";
  fps = 0;
  private renderer: THREE.WebGLRenderer | null = null;
  private composer: EffectComposer | null = null;
  private renderPass: RenderPass | null = null;
  private bloomPass: UnrealBloomPass | null = null;
  private world: World | null = null;
  private raf = 0;
  private last = 0;
  private time = 0;
  private frames = 0;
  private fpsWindow = 0;
  private scale = 1;

  constructor(private readonly stage: Stage) {
    this.canvas = document.createElement("canvas");
    this.canvas.className = "gl-canvas";
    this.canvas.width = STAGE_W;
    this.canvas.height = STAGE_H;
    stage.glLayer.append(this.canvas);
    stage.onResize((scale) => {
      this.scale = scale;
      this.resize();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.stop();
      else if (this.world) this.start();
    });
  }

  private ensure() {
    if (this.renderer) return;
    const renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.setClearColor(0x0b0c0d, 1);
    this.renderer = renderer;

    // Sem MSAA por padrão: MSAA em textura de ponto flutuante travava a GPU
    // (ANGLE/D3D11) depois de algumas cenas. O SMAA no fim faz o antisserrilhado.
    const msaa = Number(new URLSearchParams(location.search).get("msaa") ?? 0);
    const target = new THREE.WebGLRenderTarget(STAGE_W, STAGE_H, {
      type: THREE.HalfFloatType,
      samples: Number.isFinite(msaa) ? msaa : 4,
    });
    const composer = new EffectComposer(renderer, target);
    this.renderPass = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(STAGE_W / 2, STAGE_H / 2),
      0.8,
      0.5,
      0.85,
    );
    composer.addPass(this.renderPass);
    composer.addPass(this.bloomPass);
    composer.addPass(new OutputPass());
    composer.addPass(new SMAAPass());
    this.composer = composer;
    this.resize();
    // Aquece os shaders do bloom com a camada ainda invisível.
    composer.render(0.016);
  }

  private pixelRatio() {
    const max = this.quality === "alta" ? 1.5 : 0.8;
    return Math.min(max, Math.max(0.5, this.scale * (window.devicePixelRatio || 1)));
  }

  private resize() {
    if (!this.renderer || !this.composer) return;
    const ratio = this.pixelRatio();
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(STAGE_W, STAGE_H, false);
    this.composer.setPixelRatio(ratio);
    this.composer.setSize(STAGE_W, STAGE_H);
  }

  private envTexture: THREE.Texture | null = null;

  /** Reflexo de estúdio (gerado uma vez) para a pintura e os vidros do carro. */
  private applyEnvironment(world: World) {
    if (world.environment === undefined || !this.renderer) return;
    if (!this.envTexture) {
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    }
    setCarEnvironment(this.envTexture, world.environment);
  }

  /**
   * Aquece um mundo: compila e desenha uma vez fora da tela, numa textura do
   * mesmo tipo do bloom, para todas as variantes de shader ficarem prontas.
   */
  async warm(world: World) {
    this.ensure();
    const renderer = this.renderer;
    if (!renderer) return;
    this.applyEnvironment(world);
    await renderer.compileAsync(world.scene, world.camera).catch(() => undefined);
    const target = new THREE.WebGLRenderTarget(96, 54, { type: THREE.HalfFloatType });
    renderer.setRenderTarget(target);
    renderer.render(world.scene, world.camera);
    renderer.setRenderTarget(null);
    target.dispose();
  }

  /** Geometrias, texturas e programas vivos na GPU (para conferir vazamentos). */
  info() {
    const memory = this.renderer?.info.memory;
    return {
      geometrias: memory?.geometries ?? 0,
      texturas: memory?.textures ?? 0,
      programas: this.renderer?.info.programs?.length ?? 0,
    };
  }

  /** Compila os shaders de um mundo antes de ele aparecer (sem travar a cena atual). */
  prepare(world: World) {
    this.ensure();
    const renderer = this.renderer;
    if (!renderer) return;
    this.applyEnvironment(world);
    void renderer
      .compileAsync(world.scene, world.camera)
      .then(() => {
        // Sobe as texturas já carregadas, para o primeiro quadro não engasgar.
        world.scene.traverse((object) => {
          const material = (object as THREE.Mesh).material;
          const list = Array.isArray(material) ? material : material ? [material] : [];
          list.forEach((m) =>
            Object.values(m).forEach((value) => {
              if (value instanceof THREE.Texture && value.image) renderer.initTexture(value);
            }),
          );
        });
      })
      .catch(() => undefined);
  }

  setWorld(world: World | null) {
    this.world = world;
    this.stage.glLayer.classList.toggle("is-active", Boolean(world));
    if (!world) {
      this.stop();
      // Cenas 2D: libera a memória do bloom (volta ao tamanho na próxima cena 3D).
      this.composer?.setSize(2, 2);
      return;
    }
    this.ensure();
    this.resize();
    this.applyEnvironment(world);
    // A cortina está cobrindo a tela: se faltar algum shader, compila agora.
    this.renderer?.compile(world.scene, world.camera);
    world.setQuality?.(this.quality);
    if (this.renderPass) {
      this.renderPass.scene = world.scene;
      this.renderPass.camera = world.camera;
    }
    if (this.bloomPass && world.bloom) {
      this.bloomPass.strength = world.bloom.strength;
      this.bloomPass.radius = world.bloom.radius;
      this.bloomPass.threshold = world.bloom.threshold;
    }
    this.start();
  }

  setQuality(quality: Quality) {
    this.quality = quality;
    this.resize();
    this.world?.setQuality?.(quality);
  }

  private start() {
    if (this.raf) return;
    this.last = performance.now();
    const loop = (now: number) => {
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.time += dt;
      this.frames += 1;
      this.fpsWindow += dt;
      if (this.fpsWindow >= 0.5) {
        this.fps = Math.round(this.frames / this.fpsWindow);
        this.frames = 0;
        this.fpsWindow = 0;
      }
      this.render(dt);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.fps = 0;
  }

  private render(dt: number) {
    const world = this.world;
    if (!world || !this.renderer) return;
    world.update(dt, this.time);
    world.beforeRender?.(this.renderer);
    if (this.quality === "alta" && this.composer) this.composer.render(dt);
    else this.renderer.render(world.scene, world.camera);
  }
}
