import "./s10-encerramento.css";
import * as THREE from "three";
import { h, maskLine } from "../../dom";
import { INTEGRANTES } from "../../roteiro";
import type { Quality } from "../gl";
import { qrSvg } from "../qr";
import {
  CarRig,
  HEX,
  Rig,
  Smoke,
  TyreMarks,
  createBox,
  createCone,
  disposeScene,
  type Box,
} from "../lib/three-kit";
import { Scene } from "../scene";

const SITE = "https://nsc.vox.dev.br";
/** O "8" (lemniscata de Gerono, como no rodapé do site): meia largura e meia altura. */
const RX = 3.5;
const RZ = 1.5;
const OMEGA = 0.62;

/**
 * Encerramento em 3D: de volta ao box, o 350Z faz oitos em volta de dois
 * cones (como no rodapé do site). Depois o piso vira laca vermelha, com o
 * nome de margem a margem, os integrantes e o QR code do site.
 */
export class EncerramentoScene extends Scene {
  readonly steps = 2;
  private box!: Box;
  private car!: CarRig;
  private smoke!: Smoke;
  private marks!: TyreMarks;
  private rig = new Rig();
  private time = 0;
  private readonly carPos = new THREE.Vector3();

  constructor() {
    super("scene-fim is-3d");
  }

  protected build() {
    const scene = new THREE.Scene();
    this.box = createBox(scene);
    for (const x of [-RX * 0.56, RX * 0.56]) {
      const cone = createCone(1);
      cone.position.x = x;
      scene.add(cone);
    }
    this.smoke = new Smoke(scene, 160);
    this.marks = new TyreMarks(scene, 14);
    this.car = new CarRig(scene, this.smoke, this.marks);
    Object.assign(this.rig.pos, { x: 0, y: 10.6, z: 9.2 });
    Object.assign(this.rig.target, { x: 0, y: 0, z: -0.9 });
    this.rig.sway = 0.12;

    this.world = {
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

    // ---------- DOM ----------
    const slogan = h(
      "h1",
      { class: "fim-slogan t-monument" },
      h("span", { class: "fim-line fim-line-1" }, maskLine("Carros são nossa paixão.")),
      h("span", { class: "fim-line fim-line-2" }, maskLine("Competir é a obsessão.")),
    );
    const qr = h("div", { class: "fim-qr" });
    void qrSvg(SITE).then((svg) => (qr.innerHTML = svg));
    const thanks = h(
      "div",
      { class: "fim-thanks" },
      h("p", { class: "fim-name t-monument" }, "NSC Garage"),
      h(
        "div",
        { class: "fim-bottom" },
        h(
          "div",
          { class: "fim-left" },
          h("p", { class: "fim-obrigado t-head" }, "Obrigado"),
          h(
            "ul",
            { class: "fim-team" },
            ...INTEGRANTES.map((i) => h("li", { class: "t-label" }, i.nome)),
          ),
        ),
        h(
          "div",
          { class: "fim-right" },
          qr,
          h("p", { class: "fim-url t-label" }, "nsc.vox.dev.br"),
        ),
      ),
    );
    this.el.append(slogan, thanks);

    // Passo 1: o slogan completo.
    this.tl
      .from(
        this.q(".fim-line-1 .mask-inner"),
        { yPercent: 150, duration: 1, ease: "expo.out" },
        0.4,
      )
      .from(
        this.q(".fim-line-2 .mask-inner"),
        { yPercent: 150, duration: 1, ease: "expo.out" },
        "<0.25",
      );
    this.mark();

    // Passo 2: piso de laca, o nome de margem a margem, o time e o QR.
    const floorMat = this.box.floor.material;
    const lacquer = new THREE.Color(HEX.accent);
    // O vermelho do rodapé: cor de laca e um brilho próprio para não escurecer fora das poças de luz.
    const glow = new THREE.Color(HEX.accent).multiplyScalar(0.55);
    this.tl
      .to(this.q(".fim-slogan .mask-inner"), {
        yPercent: -150,
        duration: 0.6,
        ease: "power3.in",
        stagger: 0.1,
      })
      .to(
        floorMat.color,
        { r: lacquer.r, g: lacquer.g, b: lacquer.b, duration: 1.1, ease: "power2.inOut" },
        "<0.2",
      )
      .to(
        floorMat.emissive,
        { r: glow.r, g: glow.g, b: glow.b, duration: 1.1, ease: "power2.inOut" },
        "<",
      )
      .to(this.rig.pos, { y: 12.2, z: 6.8, duration: 1.4, ease: "power2.inOut" }, "<")
      .to(this.rig.target, { z: 0.8, duration: 1.4, ease: "power2.inOut" }, "<")
      .fromTo(
        this.q(".fim-name"),
        { yPercent: 40, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.9, ease: "expo.out" },
        "-=0.6",
      )
      .fromTo(
        this.q(".fim-left > *"),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.12 },
        "-=0.4",
      )
      .fromTo(
        this.q(".fim-right"),
        { x: 40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6 },
        "<0.1",
      );
    this.mark();
  }

  private update(dt: number, time: number) {
    this.time += dt;
    const t = this.time * OMEGA;
    this.carPos.set(RX * Math.sin(t), 0, RZ * Math.sin(t) * Math.cos(t) * 2);
    this.car.moveTo(this.carPos, dt);
    this.smoke.update(dt);
    this.marks.update(dt);
    this.rig.apply(time);
  }
}
