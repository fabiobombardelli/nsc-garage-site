import "./s06-criacao.css";
import * as THREE from "three";
import { h } from "../../dom";
import type { Quality, World } from "../gl";
import { countTo } from "../lib/car2d";
import { CarRig, HEX, Rig, createBox, disposeScene, toStage } from "../lib/three-kit";
import { Scene } from "../scene";

const DECK = { w: 5.4, d: 3.2, h: 0.16 };
const LEVELS = [
  { name: "Carroceria", sub: "o que você vê", check: "", y: 4.5 },
  { name: "Motor", sub: "as regras", check: "✓ confere as regras", y: 2.6 },
  { name: "Garagem", sub: "os dados", check: "✓ confere de novo", y: 0.7 },
];
const GRID = { cols: 11, rows: 7, gap: 0.62, z: 6.6 };
const TESTS = 77;

/**
 * Criação em 3D: o site como um carro de competição num elevador de box.
 * Carroceria (o que você vê), motor (as regras) e garagem (os dados). Um
 * pedido de agendamento desce conferido duas vezes; depois, 77 cones acendem
 * (os testes) e a esteira GitHub → testes → no ar.
 */
export class CriacaoScene extends Scene {
  readonly steps = 3;
  private rig = new Rig();
  private decks: THREE.Group[] = [];
  private labels: HTMLElement[] = [];
  private gear!: THREE.Group;
  private token!: THREE.Group;
  /** Um material por cone e por anel: acender é só trocar a cor (sem enviar buffer à GPU). */
  private coneMats: THREE.MeshStandardMaterial[] = [];
  private ringMats: THREE.MeshBasicMaterial[] = [];
  private tests = new THREE.Group();
  private lit = { p: 0 };
  private readonly dim = new THREE.Color(HEX.accent).multiplyScalar(0.22);
  private readonly bright = new THREE.Color(HEX.accent);
  private carRig!: CarRig;

  constructor() {
    super("scene-criacao is-3d");
  }

  protected build() {
    const scene = new THREE.Scene();
    createBox(scene, { scale: 0.9, center: new THREE.Vector3(0, 0, 1.5) });

    const metal = new THREE.MeshStandardMaterial({
      color: HEX.edge,
      roughness: 0.35,
      metalness: 0.8,
    });
    const deckMat = new THREE.MeshStandardMaterial({
      color: HEX.raised,
      roughness: 0.6,
      metalness: 0.3,
    });
    const ledMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(2.2, 2.2, 2.3),
      toneMapped: false,
    });
    const deckGeo = new THREE.BoxGeometry(DECK.w, DECK.h, DECK.d);
    const edges = new THREE.EdgesGeometry(deckGeo);

    // Colunas do elevador.
    const postGeo = new THREE.CylinderGeometry(0.09, 0.09, 5.4, 14);
    for (const x of [-DECK.w / 2 - 0.15, DECK.w / 2 + 0.15]) {
      for (const z of [-DECK.d / 2, DECK.d / 2]) {
        const post = new THREE.Mesh(postGeo, metal);
        post.position.set(x, 2.7, z);
        scene.add(post);
      }
    }

    // Plataformas (começam recolhidas no piso).
    LEVELS.forEach(() => {
      const deck = new THREE.Group();
      deck.add(new THREE.Mesh(deckGeo, deckMat), new THREE.LineSegments(edges, ledMat));
      deck.position.y = 0.09;
      scene.add(deck);
      this.decks.push(deck);
    });
    const [top, middle, bottom] = this.decks as [THREE.Group, THREE.Group, THREE.Group];

    // Carroceria: o 350Z.
    this.carRig = new CarRig(scene, null, null);
    top.add(this.carRig.group);
    this.carRig.group.position.set(-0.4, DECK.h / 2, 0);
    this.carRig.group.rotation.y = Math.PI / 2 + 0.25;

    // Motor: duas engrenagens.
    this.gear = new THREE.Group();
    const makeGear = (radius: number, teeth: number) => {
      const gear = new THREE.Group();
      gear.add(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.22, 48), metal));
      const toothGeo = new THREE.BoxGeometry(0.2, 0.22, 0.26);
      for (let i = 0; i < teeth; i += 1) {
        const tooth = new THREE.Mesh(toothGeo, metal);
        const a = (i / teeth) * Math.PI * 2;
        tooth.position.set(Math.cos(a) * (radius + 0.1), 0, Math.sin(a) * (radius + 0.1));
        tooth.rotation.y = -a;
        gear.add(tooth);
      }
      return gear;
    };
    const big = makeGear(0.78, 14);
    const small = makeGear(0.46, 9);
    small.position.set(1.42, 0, 0.1);
    this.gear.add(big, small);
    this.gear.position.set(-0.5, DECK.h / 2 + 0.11, 0);
    middle.add(this.gear);

    // Garagem: o banco de dados (discos empilhados com anel de LED).
    const discGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.3, 48);
    const ringGeo = new THREE.TorusGeometry(0.72, 0.022, 8, 64);
    for (let i = 0; i < 3; i += 1) {
      const disc = new THREE.Mesh(discGeo, deckMat);
      disc.position.set(-0.5, DECK.h / 2 + 0.15 + i * 0.36, 0);
      const ledRing = new THREE.Mesh(
        ringGeo,
        new THREE.MeshBasicMaterial({ color: new THREE.Color(1.8, 1.8, 1.9), toneMapped: false }),
      );
      ledRing.rotation.x = Math.PI / 2;
      ledRing.position.set(-0.5, DECK.h / 2 + 0.3 + i * 0.36, 0);
      bottom.add(disc, ledRing);
    }

    // O pedido de agendamento: disco amarelo de foco.
    this.token = new THREE.Group();
    const tokenMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.08, 40),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(HEX.focus).multiplyScalar(2.4),
        toneMapped: false,
      }),
    );
    this.token.add(tokenMesh);
    this.token.position.set(1.4, 4.66, 0.6);
    this.token.scale.setScalar(0.001);
    scene.add(this.token);

    // Os 77 testes: cones pequenos com anel que acende.
    const coneGeo = new THREE.ConeGeometry(0.13, 0.36, 20);
    coneGeo.translate(0, 0.2, 0);
    const testRing = new THREE.RingGeometry(0.2, 0.26, 32);
    testRing.rotateX(-Math.PI / 2);
    for (let i = 0; i < TESTS; i += 1) {
      const col = i % GRID.cols;
      const row = Math.floor(i / GRID.cols);
      const x = (col - (GRID.cols - 1) / 2) * GRID.gap;
      const z = GRID.z + (row - (GRID.rows - 1) / 2) * GRID.gap;
      const coneMat = new THREE.MeshStandardMaterial({ color: this.dim, roughness: 0.45 });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      cone.position.set(x, 0, z);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        toneMapped: false,
        transparent: true,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(testRing, ringMat);
      ring.position.set(x, 0.012, z);
      this.tests.add(cone, ring);
      this.coneMats.push(coneMat);
      this.ringMats.push(ringMat);
    }
    scene.add(this.tests);
    // Escondidos por escala (não por `visible`), para os shaders já compilarem antes.
    this.tests.scale.setScalar(0.0001);
    this.paintTests();

    // Câmera: começa baixa e perto; sobe para três quartos.
    Object.assign(this.rig.pos, { x: 8.5, y: 1.6, z: 9.5 });
    Object.assign(this.rig.target, { x: 0, y: 1.6, z: 0 });
    this.rig.sway = 0.05;

    this.world = {
      scene,
      camera: this.rig.camera,
      bloom: { strength: 0.55, radius: 0.45, threshold: 1.1 },
      environment: 0.45,
      update: (dt, time) => this.update(dt, time),
      setQuality: (_q: Quality) => undefined,
      dispose: () => {
        this.carRig.dispose();
        disposeScene(scene);
      },
    } satisfies World;

    // ---------- DOM: rótulos das plataformas, contador e esteira ----------
    this.labels = LEVELS.map((level) =>
      h(
        "div",
        { class: "cr-label light-panel" },
        h("p", { class: "cr-label-name t-head" }, level.name),
        h("p", { class: "cr-label-sub t-label" }, level.sub),
        level.check ? h("p", { class: "cr-label-check t-label" }, level.check) : null,
      ),
    );
    const counter = h("p", { class: "cr-count t-head" }, "0");
    const counterBox = h(
      "div",
      { class: "cr-counter" },
      counter,
      h("p", { class: "cr-count-label t-lead" }, "testes automáticos passando"),
    );
    const pipeBoxes = ["GitHub", "Testes", "No ar"].map((text) =>
      h("p", { class: "cr-pipe-box t-head" }, text),
    );
    const arrows = [0, 1].map(() =>
      h("span", { class: "cr-pipe-arrow" }, h("span", { class: "cr-pipe-fill" })),
    );
    const pipe = h(
      "div",
      { class: "cr-pipe" },
      pipeBoxes[0] ?? null,
      arrows[0] ?? null,
      pipeBoxes[1] ?? null,
      arrows[1] ?? null,
      pipeBoxes[2] ?? null,
    );
    const kicker = h("p", { class: "cr-kicker t-placa" }, "O site é um carro de competição");
    this.el.append(kicker, ...this.labels, counterBox, pipe);

    // ---------- Linha do tempo ----------
    this.labels.forEach((label) => (label.style.opacity = "0"));
    const checks = this.q(".cr-label-check");

    // Passo 1: as plataformas sobem uma a uma; a câmera inclina.
    this.tl
      .fromTo(kicker, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0)
      .to(this.rig.pos, { x: 7.6, y: 7.2, z: 10.5, duration: 3.6, ease: "power2.inOut" }, 0)
      .to(this.rig.target, { y: 2.3, duration: 3.6, ease: "power2.inOut" }, 0);
    this.decks.forEach((deck, i) => {
      const at = 0.3 + i * 0.75;
      this.tl
        .to(deck.position, { y: LEVELS[i]?.y ?? 0, duration: 1.1, ease: "power3.inOut" }, at)
        .fromTo(this.labels[i] ?? [], { opacity: 0 }, { opacity: 1, duration: 0.5 }, at + 0.8);
    });
    this.mark();

    // Passo 2: o pedido desce, conferido no motor e de novo na garagem.
    this.tl
      .to(this.token.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "back.out(2)" })
      .to(this.token.position, { z: 2.4, duration: 0.5, ease: "power2.inOut" })
      .to(this.token.position, { y: 2.76, duration: 0.8, ease: "power2.inOut" })
      .to(this.token.position, { z: 0.6, duration: 0.5, ease: "power2.inOut" })
      .fromTo(checks[0] ?? [], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 })
      .to(this.token.position, { z: 2.4, duration: 0.5, ease: "power2.inOut" }, "+=0.5")
      .to(this.token.position, { y: 0.86, duration: 0.8, ease: "power2.inOut" })
      .to(this.token.position, { z: 0.6, duration: 0.5, ease: "power2.inOut" })
      .fromTo(checks[1] ?? [], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
    this.mark();

    // Passo 3: os 77 testes e a esteira de publicação.
    this.tl
      .to([...this.labels, kicker], { opacity: 0, duration: 0.4 })
      .set(this.tests.scale, { x: 1, y: 1, z: 1 }, "<0.3")
      .to(this.rig.pos, { x: 0, y: 9.6, z: 12.4, duration: 1.6, ease: "power2.inOut" }, "<")
      .to(
        this.rig.target,
        { x: 0, y: 0, z: GRID.z - 1.5, duration: 1.6, ease: "power2.inOut" },
        "<",
      )
      .fromTo(counterBox, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4")
      .to(
        this.lit,
        { p: TESTS + 6, duration: 2.4, ease: "power1.inOut", onUpdate: () => this.paintTests() },
        "<",
      )
      .add(
        countTo(counter, TESTS, 2.2, (n) => String(n)),
        "<",
      )
      .fromTo(pipe, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.6");
    pipeBoxes.forEach((box, i) => {
      this.tl.to(
        box,
        { backgroundColor: "#f2f4f5", color: "#151719", duration: 0.3 },
        i === 0 ? ">" : ">-0.05",
      );
      const arrow = arrows[i]?.querySelector(".cr-pipe-fill");
      if (arrow)
        this.tl.fromTo(arrow, { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power2.inOut" });
    });
    this.mark();
  }

  /** Acende os anéis até o teste `lit.p` (um brilho que assenta). */
  private paintTests() {
    const p = this.lit.p;
    for (let i = 0; i < TESTS; i += 1) {
      const on = i < p;
      this.coneMats[i]?.color.copy(on ? this.bright : this.dim);
      const flash = on ? 0.85 + 1.4 * Math.max(0, 1 - (p - i) / 8) : 0;
      this.ringMats[i]?.color.setRGB(flash, flash, flash);
    }
  }

  private update(dt: number, time: number) {
    const [big, small] = this.gear.children;
    if (big) big.rotation.y += dt * 0.7;
    if (small) small.rotation.y -= dt * 0.7 * (0.78 / 0.46);
    this.token.rotation.y += dt * 1.5;
    this.rig.apply(time);
    // Rótulos seguem as plataformas (canto da frente, à direita).
    this.decks.forEach((deck, i) => {
      const label = this.labels[i];
      if (!label) return;
      const anchor = new THREE.Vector3(DECK.w / 2 + 0.3, deck.position.y + 0.1, DECK.d / 2);
      const p = toStage(anchor, this.rig.camera);
      label.style.transform = `translate(${Math.round(p.x + 26)}px, ${Math.round(p.y - 40)}px)`;
    });
  }
}
