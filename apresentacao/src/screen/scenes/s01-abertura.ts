import "./s01-abertura.css";
import gsap from "gsap";
import * as THREE from "three";
import { h, maskLine } from "../../dom";
import type { Quality, World } from "../gl";
import {
  CarRig,
  Rig,
  Smoke,
  TyreMarks,
  createBox,
  createCone,
  disposeScene,
  type Box,
} from "../lib/three-kit";
import { Scene } from "../scene";

/** Raio do zerinho em volta do cone e velocidade angular. */
const RADIUS = 1.6;
const OMEGA = 1.55;

/** Piscada de lâmpada fluorescente (multiplicador da intensidade). */
const FLICKER = [0, 0.9, 0.1, 0.7, 0.05, 1, 0.55, 1];

/**
 * Abertura em 3D: o box à noite. As luzes de LED acendem piscando, o 350Z
 * entra derrapando em espiral e passa a fazer zerinho em volta do cone.
 * Depois entra o slogan completo, nas duas frases.
 */
export class AberturaScene extends Scene {
  readonly steps = 2;
  private box!: Box;
  private car!: CarRig;
  private smoke!: Smoke;
  private marks!: TyreMarks;
  private rig = new Rig();
  private driving = false;
  private driveTime = 0;
  private readonly carPos = new THREE.Vector3();
  private readonly lightLevel = [0, 0, 0];

  constructor() {
    super("scene-abertura is-3d");
  }

  protected build() {
    const scene = new THREE.Scene();
    this.box = createBox(scene);
    this.box.lights.forEach((light) => (light.intensity = 0));
    const cone = createCone(1.25);
    scene.add(cone);
    this.smoke = new Smoke(scene, 160);
    this.marks = new TyreMarks(scene, 14);
    this.car = new CarRig(scene, this.smoke, this.marks);
    this.car.group.visible = false;

    this.rig.pos.x = 0;
    this.rig.pos.y = 9.4;
    this.rig.pos.z = 9.6;
    this.rig.target.z = -0.3;
    this.rig.sway = 0.22;

    const world: World = {
      scene,
      camera: this.rig.camera,
      bloom: { strength: 0.6, radius: 0.5, threshold: 1.15 },
      environment: 0.45,
      update: (dt, time) => this.update(dt, time),
      beforeRender: (renderer) => this.marks.flush(renderer),
      setQuality: (quality: Quality) => {
        this.smoke.limit = quality === "alta" ? 160 : 70;
      },
      dispose: () => {
        this.smoke.dispose();
        this.marks.dispose();
        this.car.dispose();
        disposeScene(scene);
      },
    };
    this.world = world;

    // ---------- Camada de DOM: LEDs do teto e slogan ----------
    const leds = h(
      "div",
      { class: "ab-leds", "aria-hidden": "true" },
      h("span", { class: "ab-led" }),
      h("span", { class: "ab-led" }),
      h("span", { class: "ab-led" }),
    );
    const slogan = h(
      "h1",
      { class: "ab-slogan t-monument" },
      h("span", { class: "ab-line ab-line-1" }, maskLine("Carros são nossa paixão.")),
      h("span", { class: "ab-line ab-line-2" }, maskLine("Competir é a obsessão.")),
    );
    const tag = h("p", { class: "ab-tag t-label" }, "NSC Garage · site e agendamento acessível");
    this.el.append(leds, slogan, tag);

    // Passo 1: as luzes acendem uma a uma, piscando; o carro entra.
    const ledEls = this.q(".ab-led");
    ledEls.forEach((led, i) => {
      const state = { v: 0 };
      this.tl.to(
        state,
        {
          keyframes: FLICKER.map((v) => ({ v, duration: 0.09 })),
          onUpdate: () => {
            led.style.opacity = String(state.v);
            this.lightLevel[i] = state.v;
          },
        },
        0.3 + i * 0.45,
      );
    });
    this.tl.to({}, { duration: 0.4 });
    this.mark();

    // Passo 2: slogan completo (duas frases), como no topo do site.
    this.tl
      .from(this.q(".ab-line-1 .mask-inner"), { yPercent: 150, duration: 1, ease: "expo.out" })
      .from(
        this.q(".ab-line-2 .mask-inner"),
        { yPercent: 150, duration: 1, ease: "expo.out" },
        "<0.25",
      )
      .fromTo(tag, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "<0.4");
    this.mark();
  }

  protected onStep(step: number, animate: boolean) {
    if (this.driving) return;
    this.driving = true;
    // O carro entra junto com a última luz (ou já fazendo zerinho, se for um salto).
    this.driveTime = animate && step === 0 ? -1.6 : 30;
    this.car.resetTrail();
  }

  private carPosition(t: number, out: THREE.Vector3) {
    // Espiral de fora para dentro até o raio do zerinho.
    const angle = 2.4 + OMEGA * t;
    const radius = RADIUS + 10 * Math.exp(-Math.max(0, t) * 0.75);
    return out.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
  }

  private update(dt: number, time: number) {
    this.box.lights.forEach(
      (light, i) => (light.intensity = (this.box.full[i] ?? 0) * (this.lightLevel[i] ?? 0)),
    );
    if (this.driving) {
      this.driveTime += dt;
      if (this.driveTime >= 0) {
        this.car.group.visible = true;
        this.carPosition(this.driveTime, this.carPos);
        this.car.moveTo(this.carPos, dt);
      }
    }
    this.smoke.update(dt);
    this.marks.update(dt);
    this.rig.apply(time);
  }

  unmount() {
    gsap.killTweensOf(this.lightLevel);
    super.unmount();
  }
}
