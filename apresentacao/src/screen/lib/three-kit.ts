import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import carGlbUrl from "../../assets/carro-370z-nsc.glb?url";

/** Comprimento do modelo 3D original (m) e a promessa do modelo carregado. */
const MODEL_LENGTH = 4.33;
let carModel: Promise<THREE.Group> | null = null;

/**
 * O Nissan 370Z em 3D com a plotagem da NSC (GLB gerado por tools/carro.ts),
 * baixado uma vez e clonado em cada cena. Marcado como compartilhado para
 * não ser descartado quando uma cena sai.
 */
export function loadCarModel(): Promise<THREE.Group> {
  carModel ??= new GLTFLoader().loadAsync(carGlbUrl).then((gltf) => {
    gltf.scene.traverse((object) => (object.userData.shared = true));
    applyCarEnvironment(gltf.scene);
    return gltf.scene;
  });
  return carModel;
}

/** Reflexo de estúdio só nos materiais do carro (o piso do box continua escuro). */
let carEnv: { texture: THREE.Texture; intensity: number } | null = null;

function applyCarEnvironment(root: THREE.Object3D) {
  if (!carEnv) return;
  const env = carEnv;
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    list.forEach((material) => {
      const m = material as THREE.MeshStandardMaterial;
      if (!("envMapIntensity" in m)) return;
      m.envMapIntensity = env.intensity;
      // Só recompila o shader quando o mapa muda (a intensidade é um uniform).
      if (m.envMap !== env.texture) {
        m.envMap = env.texture;
        m.needsUpdate = true;
      }
    });
  });
}

export function setCarEnvironment(texture: THREE.Texture, intensity: number) {
  if (carEnv?.texture === texture && carEnv.intensity === intensity) return;
  carEnv = { texture, intensity };
  void carModel?.then(applyCarEnvironment);
}
import { STAGE_H, STAGE_W } from "../stage";

/** Cores do site (sRGB) usadas no 3D. */
export const HEX = {
  carbon: 0x151719,
  carbonDeep: 0x0b0c0d,
  floor: 0x232528,
  raised: 0x2d2f32,
  ink: 0xf2f4f5,
  muted: 0xb4b8bb,
  accent: 0xd01d21,
  rubber: 0x08090a,
  edge: 0x83868a,
  focus: 0xfbd530,
  paint: 0xe6e8ea,
};

/** Medidas do carro no mundo (a imagem tem 240×488). */
export const CAR_W = 1.05;
export const CAR_L = CAR_W * (488 / 240);

function canvasTexture(size: number, draw: (ctx: CanvasRenderingContext2D, size: number) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Mancha radial (fumaça e sombra de contato). */
export function radialTexture(inner: string, outer: string, size = 128) {
  return canvasTexture(size, (ctx, s) => {
    const gradient = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gradient.addColorStop(0, inner);
    gradient.addColorStop(1, outer);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, s, s);
  });
}

// ---------------------------------------------------------------------------
// O box: piso de epóxi, luzes de LED no teto (fora de quadro) e névoa.
// ---------------------------------------------------------------------------

export type Box = {
  group: THREE.Group;
  floor: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshStandardMaterial>;
  /** As três luzes do teto (uma por barra de LED). */
  lights: THREE.SpotLight[];
  /** Intensidade de cada luz quando acesa. */
  readonly full: number[];
};

/**
 * Três focos do teto (fora de quadro) desenham poças de luz no piso de
 * epóxi, como as barras de LED do box. Sem queda com a distância (decay 0):
 * a intensidade é a própria iluminação, fácil de acertar.
 */
export function createBox(
  scene: THREE.Scene,
  opts: { scale?: number; center?: THREE.Vector3 } = {},
): Box {
  const group = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({
      color: HEX.floor,
      roughness: 0.55,
      metalness: 0.1,
      envMapIntensity: 0.1,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  group.add(floor);

  const k = opts.scale ?? 1;
  const center = opts.center ?? new THREE.Vector3();
  const specs = [
    { x: -6.5, aim: -3.6, angle: 0.42, full: 1.5 * k },
    { x: 0, aim: 0, angle: 0.52, full: 3.4 * k },
    { x: 6.5, aim: 3.6, angle: 0.42, full: 1.5 * k },
  ];
  const lights = specs.map((spec) => {
    const light = new THREE.SpotLight(0xf4f7ff, spec.full, 0, spec.angle, 0.95, 0);
    light.position.set(center.x + spec.x, 13, center.z + 0.5);
    light.target.position.set(center.x + spec.aim, 0, center.z);
    group.add(light, light.target);
    return light;
  });
  group.add(new THREE.HemisphereLight(0x9aa6b8, 0x050505, 0.4));
  scene.add(group);
  scene.fog = new THREE.FogExp2(HEX.carbonDeep, 0.03);
  scene.background = new THREE.Color(HEX.carbonDeep);
  return { group, floor, lights, full: specs.map((spec) => spec.full) };
}

// ---------------------------------------------------------------------------
// Cone de pista (laca vermelha com faixa branca e base de borracha).
// ---------------------------------------------------------------------------

export function createCone(scale = 1): THREE.Group {
  const group = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.05, 0.62),
    new THREE.MeshStandardMaterial({ color: HEX.rubber, roughness: 0.9 }),
  );
  base.position.y = 0.025;
  const height = 0.78;
  const radius = 0.24;
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 40),
    new THREE.MeshStandardMaterial({
      color: HEX.accent,
      roughness: 0.45,
      emissive: HEX.accent,
      emissiveIntensity: 0.12,
    }),
  );
  body.position.y = 0.05 + height / 2;
  // Faixa branca entre 40% e 60% da altura (raio do cone naquela altura).
  const r = (h: number) => radius * (1 - h) + 0.004;
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(r(0.62), r(0.42), height * 0.2, 40, 1, true),
    new THREE.MeshStandardMaterial({
      color: HEX.paint,
      roughness: 0.4,
      emissive: HEX.paint,
      emissiveIntensity: 0.15,
    }),
  );
  band.position.y = 0.05 + height * 0.52;
  group.add(base, body, band);
  group.scale.setScalar(scale);
  return group;
}

// ---------------------------------------------------------------------------
// Fumaça: um conjunto fixo de sprites reaproveitados.
// ---------------------------------------------------------------------------

type Puff = {
  sprite: THREE.Sprite;
  life: number;
  max: number;
  vel: THREE.Vector3;
  size: number;
  grow: number;
};

export class Smoke {
  private puffs: Puff[] = [];
  private next = 0;
  private texture = radialTexture("rgba(255,255,255,0.9)", "rgba(255,255,255,0)");
  limit: number;

  constructor(
    scene: THREE.Scene,
    private readonly max = 150,
  ) {
    this.limit = max;
    for (let i = 0; i < max; i += 1) {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: this.texture,
          color: 0xd9dcdf,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          fog: true,
        }),
      );
      sprite.visible = false;
      scene.add(sprite);
      this.puffs.push({ sprite, life: 0, max: 1, vel: new THREE.Vector3(), size: 1, grow: 1 });
    }
  }

  emit(position: THREE.Vector3, push: THREE.Vector3, size = 0.6) {
    const puff = this.puffs[this.next];
    this.next = (this.next + 1) % Math.max(1, Math.min(this.limit, this.max));
    if (!puff) return;
    puff.life = 0;
    puff.max = 2.2 + Math.random() * 1.6;
    puff.size = size * (0.8 + Math.random() * 0.4);
    puff.grow = 2.6 + Math.random() * 1.6;
    puff.vel.set(
      push.x * 0.6 + (Math.random() - 0.5) * 0.5,
      0.35 + Math.random() * 0.35,
      push.z * 0.6 + (Math.random() - 0.5) * 0.5,
    );
    puff.sprite.position.copy(position);
    puff.sprite.visible = true;
  }

  update(dt: number) {
    for (const puff of this.puffs) {
      if (!puff.sprite.visible) continue;
      puff.life += dt;
      const t = puff.life / puff.max;
      if (t >= 1) {
        puff.sprite.visible = false;
        continue;
      }
      puff.sprite.position.addScaledVector(puff.vel, dt);
      puff.vel.multiplyScalar(1 - dt * 0.6);
      const scale = puff.size * (1 + t * puff.grow);
      puff.sprite.scale.set(scale, scale, 1);
      const material = puff.sprite.material;
      material.opacity = (t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85) * 0.27;
    }
  }

  dispose() {
    this.texture.dispose();
    this.puffs.forEach((p) => p.sprite.material.dispose());
  }
}

// ---------------------------------------------------------------------------
// Marcas de pneu: desenhadas num canvas que cobre o piso em volta da cena.
// ---------------------------------------------------------------------------

/**
 * Marcas de pneu acumuladas na própria GPU: a cada quadro, um "carimbo"
 * escuro por pneu é desenhado numa textura de renderização que nunca é
 * limpa. Nada sobe da CPU (enviar um canvas a cada quadro travava o ANGLE).
 */
export class TyreMarks {
  readonly mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  private target: THREE.WebGLRenderTarget;
  private stampScene = new THREE.Scene();
  private stampCamera: THREE.OrthographicCamera;
  private stamps: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>[] = [];
  private queue: [THREE.Vector3, THREE.Vector3][] = [];
  private cleared = false;
  private stampGeometry = new THREE.PlaneGeometry(1, 1);
  private stampMaterial = new THREE.MeshBasicMaterial({
    color: 0x050607,
    transparent: true,
    opacity: 0.2,
    depthTest: false,
    depthWrite: false,
  });

  constructor(scene: THREE.Scene, span = 16, resolution = 1024) {
    this.target = new THREE.WebGLRenderTarget(resolution, resolution, { depthBuffer: false });
    this.stampCamera = new THREE.OrthographicCamera(
      -span / 2,
      span / 2,
      span / 2,
      -span / 2,
      -1,
      1,
    );
    for (let i = 0; i < 8; i += 1) {
      const stamp = new THREE.Mesh(this.stampGeometry, this.stampMaterial);
      stamp.visible = false;
      this.stampScene.add(stamp);
      this.stamps.push(stamp);
    }
    this.mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(span, span),
      new THREE.MeshBasicMaterial({
        map: this.target.texture,
        transparent: true,
        depthWrite: false,
      }),
    );
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = 0.006;
    scene.add(this.mesh);
  }

  stroke(from: THREE.Vector3, to: THREE.Vector3) {
    if (this.queue.length < this.stamps.length) this.queue.push([from.clone(), to.clone()]);
  }

  /** Desenha os carimbos pendentes (chamado pelo GL antes de cada quadro). */
  flush(renderer: THREE.WebGLRenderer) {
    if (!this.cleared) {
      const previous = renderer.getClearAlpha();
      const color = new THREE.Color();
      renderer.getClearColor(color);
      renderer.setRenderTarget(this.target);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, false, false);
      renderer.setClearColor(color, previous);
      renderer.setRenderTarget(null);
      this.cleared = true;
    }
    if (!this.queue.length) return;
    this.stamps.forEach((stamp, i) => {
      const segment = this.queue[i];
      stamp.visible = Boolean(segment);
      if (!segment) return;
      const [a, b] = segment;
      // Plano XY da câmera ortográfica: (x, -z) do mundo.
      const ax = a.x;
      const ay = -a.z;
      const bx = b.x;
      const by = -b.z;
      const length = Math.hypot(bx - ax, by - ay);
      stamp.position.set((ax + bx) / 2, (ay + by) / 2, 0);
      stamp.rotation.z = Math.atan2(by - ay, bx - ax);
      stamp.scale.set(length + 0.12, 0.2, 1);
    });
    this.queue = [];
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setRenderTarget(this.target);
    renderer.render(this.stampScene, this.stampCamera);
    renderer.setRenderTarget(null);
    renderer.autoClear = autoClear;
  }

  update(_dt: number) {}

  dispose() {
    this.target.dispose();
    this.stampGeometry.dispose();
    this.stampMaterial.dispose();
  }
}

// ---------------------------------------------------------------------------
// O carro: a mesma imagem do site, deitada no piso, com sombra de contato.
// Segue uma trajetória p(t); a dianteira aponta para dentro da curva (drift).
// ---------------------------------------------------------------------------

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));

export class CarRig {
  readonly group = new THREE.Group();
  readonly body: THREE.Group;
  private shadowTexture = radialTexture("rgba(0,0,0,0.8)", "rgba(0,0,0,0)");
  private heading = 0;
  private drift = 0;
  private prev = new THREE.Vector3();
  private prevWheels: THREE.Vector3[] = [new THREE.Vector3(), new THREE.Vector3()];
  private hasPrev = false;
  private puffClock = 0;

  constructor(
    scene: THREE.Scene,
    private readonly smoke: Smoke | null,
    private readonly marks: TyreMarks | null,
  ) {
    // O 370Z em 3D com a plotagem da NSC (clonado do modelo compartilhado).
    this.body = new THREE.Group();
    void loadCarModel().then((model) => {
      const car = model.clone(true);
      car.scale.setScalar(CAR_L / MODEL_LENGTH);
      this.body.add(car);
    });
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(CAR_W * 1.6, CAR_L * 1.3),
      new THREE.MeshBasicMaterial({
        map: this.shadowTexture,
        transparent: true,
        depthWrite: false,
      }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.012;
    this.group.add(shadow, this.body);
    scene.add(this.group);
  }

  /** Coloca o carro em `position`, calculando direção e drift pelo movimento. */
  moveTo(position: THREE.Vector3, dt: number, smoking = true) {
    if (!this.hasPrev) {
      this.prev.copy(position);
      this.group.position.copy(position);
      this.hasPrev = true;
      return;
    }
    const dx = position.x - this.prev.x;
    const dz = position.z - this.prev.z;
    const speed = Math.hypot(dx, dz) / Math.max(dt, 1e-4);
    if (speed > 0.05) {
      const travel = Math.atan2(dx, dz);
      const turn = wrap(travel - this.heading) / Math.max(dt, 1e-4);
      this.heading = travel;
      // Dianteira para dentro da curva: até ~58°.
      const target = THREE.MathUtils.clamp(turn * 0.55, -1.0, 1.0);
      this.drift += (target - this.drift) * Math.min(1, dt * 3);
    }
    this.prev.copy(position);
    this.group.position.copy(position);
    this.group.rotation.y = this.heading + this.drift;
    // A carroceria inclina para fora da curva, como num carro de verdade.
    this.body.rotation.z += (-this.drift * 0.085 - this.body.rotation.z) * Math.min(1, dt * 4);

    // Pneus traseiros: marcas e fumaça.
    const yaw = this.group.rotation.y;
    const fx = Math.sin(yaw);
    const fz = Math.cos(yaw);
    const rear = CAR_L * 0.34;
    const side = CAR_W * 0.36;
    const wheels = [-1, 1].map(
      (sign) =>
        new THREE.Vector3(
          position.x - fx * rear + fz * side * sign,
          0.05,
          position.z - fz * rear - fx * side * sign,
        ),
    );
    if (this.marks && speed > 0.3) {
      wheels.forEach((wheel, i) => {
        const prev = this.prevWheels[i];
        if (prev && prev.lengthSq() > 0) this.marks?.stroke(prev, wheel);
      });
    }
    wheels.forEach((wheel, i) => this.prevWheels[i]?.copy(wheel));

    this.puffClock += dt;
    if (this.smoke && smoking && speed > 0.5 && this.puffClock > 0.045) {
      this.puffClock = 0;
      const push = new THREE.Vector3(-fx, 0, -fz);
      const amount = Math.min(1, Math.abs(this.drift) * 1.4 + 0.25);
      wheels.forEach((wheel) => {
        if (Math.random() < amount)
          this.smoke?.emit(wheel.clone().setY(0.25), push, 0.55 + amount * 0.35);
      });
    }
  }

  resetTrail() {
    this.hasPrev = false;
    this.prevWheels.forEach((w) => w.set(0, 0, 0));
  }

  dispose() {
    this.shadowTexture.dispose();
  }
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

/** Libera geometrias, materiais e texturas de uma cena three.js (menos o carro compartilhado). */
export function disposeScene(scene: THREE.Scene) {
  scene.traverse((object) => {
    if (object.userData.shared) return;
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value instanceof THREE.Texture) value.dispose();
      });
      material.dispose();
    });
  });
}

/** Converte um ponto do mundo em px do palco (para rótulos em DOM). */
export function toStage(point: THREE.Vector3, camera: THREE.Camera) {
  const v = point.clone().project(camera);
  return { x: ((v.x + 1) / 2) * STAGE_W, y: ((1 - v.y) / 2) * STAGE_H, behind: v.z > 1 };
}

/** Câmera olhando para um alvo, com posição e alvo animáveis pelo GSAP. */
export class Rig {
  readonly camera = new THREE.PerspectiveCamera(36, STAGE_W / STAGE_H, 0.1, 200);
  readonly pos = { x: 0, y: 10, z: 10 };
  readonly target = { x: 0, y: 0, z: 0 };
  sway = 0;
  swaySpeed = 0.12;

  apply(time: number) {
    const angle = Math.sin(time * this.swaySpeed) * this.sway;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const rx = this.pos.x - this.target.x;
    const rz = this.pos.z - this.target.z;
    this.camera.position.set(
      this.target.x + rx * cos + rz * sin,
      this.pos.y,
      this.target.z - rx * sin + rz * cos,
    );
    this.camera.lookAt(this.target.x, this.target.y, this.target.z);
  }
}
