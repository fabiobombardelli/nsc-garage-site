/**
 * Ferramenta (só desenvolvimento): carrega o Nissan 370Z em FBX, aplica a
 * plotagem da NSC na textura externa e exporta um GLB enxuto para a
 * apresentação. O FBX original não vai para o repositório: o script
 * scripts/carro.cjs serve os arquivos em /modelo/ e chama as funções abaixo.
 */
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(1200, 800);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x2a2d31);
scene.add(new THREE.HemisphereLight(0xffffff, 0x333333, 1.2));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(4, 8, 6);
scene.add(sun);
const camera = new THREE.PerspectiveCamera(30, 1200 / 800, 0.01, 1000);
let model: THREE.Group | null = null;
let size = new THREE.Vector3();
let center = new THREE.Vector3();

function summary(root: THREE.Object3D) {
  const meshes: object[] = [];
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = (
      Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    ) as THREE.MeshPhongMaterial[];
    meshes.push({
      name: mesh.name,
      verts: mesh.geometry.attributes.position?.count,
      groups: mesh.geometry.groups.length,
      mats: mats.map(
        (m) =>
          `${m.name}|${m.type}|${(m.map?.image as HTMLImageElement | undefined)?.src?.split("/").pop() ?? "-"}`,
      ),
    });
  });
  return meshes;
}

async function load() {
  const loader = new FBXLoader();
  model = await loader.loadAsync("/modelo/FINAL_MODEL_N.fbx");
  scene.add(model);
  const box = new THREE.Box3().setFromObject(model);
  box.getSize(size);
  box.getCenter(center);
  await new Promise((r) => setTimeout(r, 1500)); // texturas
  return { size: size.toArray(), center: center.toArray(), meshes: summary(model) };
}

function view(kind: "lado" | "outro" | "cima" | "frente" | "tres4" | "tras") {
  const d = Math.max(size.x, size.y, size.z) * 2.2;
  const c = center;
  const pos: Record<string, [number, number, number]> = {
    lado: [c.x + d, c.y, c.z],
    outro: [c.x - d, c.y, c.z],
    cima: [c.x, c.y + d, c.z + 0.001],
    frente: [c.x, c.y, c.z + d],
    tras: [c.x, c.y, c.z - d],
    tres4: [c.x + d * 0.6, c.y + d * 0.45, c.z + d * 0.6],
  };
  const p = pos[kind] ?? [d, d, d];
  camera.position.set(...p);
  camera.lookAt(c);
  renderer.render(scene, camera);
}

/** Troca a textura de pintura por uma grade numerada (para mapear as regiões). */
function debugUV(materialName: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = `hsl(${(x * 45 + y * 20) % 360} 70% ${y % 2 ? 45 : 60}%)`;
      ctx.fillRect(x * 128, y * 128, 128, 128);
      ctx.fillStyle = "#000";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText(`${x}${y}`, x * 128 + 30, y * 128 + 80);
    }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  model?.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = (
      Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    ) as THREE.MeshPhongMaterial[];
    mats.forEach((m) => {
      if (m.name === materialName) {
        m.map = tex;
        m.needsUpdate = true;
      }
    });
  });
}

/** Caixa das coordenadas de textura de cada malha de um material, em px do canvas 1024 (y de cima para baixo). */
function uvBounds(materialName: string) {
  const out: object[] = [];
  model?.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = mesh.material as THREE.Material;
    if (Array.isArray(mesh.material) || mat.name !== materialName) return;
    const uv = mesh.geometry.attributes.uv;
    if (!uv) return;
    let minX = 1e9,
      minY = 1e9,
      maxX = -1e9,
      maxY = -1e9;
    for (let i = 0; i < uv.count; i++) {
      const x = uv.getX(i) * 1024;
      const y = (1 - uv.getY(i)) * 1024;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
    out.push({
      name: mesh.name.replace("z_nismoLOD_A_", ""),
      box: [minX, minY, maxX, maxY].map(Math.round),
    });
  });
  return out;
}

// ---------------------------------------------------------------------------
// Plotagem da NSC (como a miniatura 2D do site): azul-marinho, capô e teto
// pretos, pinceladas vermelhas com filetes brancos, "NSC" nas portas,
// "RODERA" em branco, o 69 e filetes dourados nos para-choques.
// Mapa da textura (1024): faixa do meio = vista de cima (frente à esquerda,
// largura do carro no eixo y, eixo em y≈384); faixa de baixo = lateral
// esquerda em pé (frente à esquerda); faixa de cima = lateral direita girada 180°.
// ---------------------------------------------------------------------------

export type Livery = {
  navy: string;
  black: string;
  red: string;
  white: string;
  gold: string;
  /** Linha da cintura e da soleira da lateral esquerda (a direita é espelhada em `mirrorY`). */
  beltY: number;
  rockerY: number;
  mirrorY: number;
  doorX: number;
  hood: [number, number, number, number];
};

export const LIVERY: Livery = {
  navy: "#1d2b5f",
  black: "#141619",
  red: "#d3122c",
  white: "#f2f4f5",
  gold: "#b98a2f",
  beltY: 605,
  rockerY: 828,
  mirrorY: 850,
  doorX: 520,
  hood: [92, 268, 790, 500],
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Pincelada irregular (polígono serrilhado) de (x0,y0) a (x1,y1). */
function brush(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  seed: number,
) {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const steps = 14;
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const taper = Math.sin(Math.PI * Math.min(1, t * 1.15)) * 0.85 + 0.15;
    const w = (width / 2) * taper;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    top.push([x + nx * w * (0.6 + rand() * 0.6), y + ny * w * (0.6 + rand() * 0.6)]);
    bottom.push([x - nx * w * (0.6 + rand() * 0.6), y - ny * w * (0.6 + rand() * 0.6)]);
  }
  ctx.beginPath();
  [...top, ...bottom.reverse()].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size: number,
  angle: number,
  color: string,
  italic = true,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.font = `${italic ? "italic " : ""}900 ${size}px "Archivo Black", "Arial Black", Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** Desenha a plotagem num canvas 1024 (cores puras; o sombreado vem depois). */
function drawLivery(L: Livery) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = L.navy;
  ctx.fillRect(0, 0, 1024, 1024);

  // Vista de cima: capô e teto pretos, com cantos arredondados.
  const [hx0, hy0, hx1, hy1] = L.hood;
  ctx.fillStyle = L.black;
  ctx.beginPath();
  ctx.roundRect(hx0, hy0, hx1 - hx0, hy1 - hy0, 60);
  ctx.fill();

  // Pinceladas vermelhas nos para-lamas (vista de cima, bordas da faixa do meio).
  ctx.fillStyle = L.red;
  brush(ctx, 110, 236, 330, 252, 46, 3);
  brush(ctx, 110, 532, 330, 516, 46, 5);
  brush(ctx, 720, 240, 960, 226, 50, 7);
  brush(ctx, 720, 528, 960, 542, 50, 9);
  ctx.fillStyle = L.white;
  brush(ctx, 140, 226, 300, 238, 10, 11);
  brush(ctx, 140, 542, 300, 530, 10, 13);

  // Laterais: a esquerda em pé; a direita, espelhada na vertical.
  const side = (flip: boolean) => {
    ctx.save();
    if (flip) {
      ctx.translate(0, L.mirrorY);
      ctx.scale(1, -1);
    }
    const b = L.beltY;
    const r = L.rockerY;
    const h = r - b;
    ctx.fillStyle = L.red;
    // Para-lama dianteiro e traseiro: pinceladas diagonais.
    brush(ctx, 150, b + h * 0.15, 380, b + h * 0.55, 70, 21);
    brush(ctx, 170, b + h * 0.6, 360, b + h * 0.9, 50, 23);
    brush(ctx, 700, b + h * 0.2, 960, b + h * 0.5, 74, 25);
    brush(ctx, 740, b + h * 0.62, 950, b + h * 0.88, 46, 27);
    ctx.fillStyle = L.white;
    brush(ctx, 190, b + h * 0.3, 350, b + h * 0.5, 9, 29);
    brush(ctx, 730, b + h * 0.36, 930, b + h * 0.46, 9, 31);
    // Filete dourado na soleira.
    ctx.fillStyle = L.gold;
    ctx.fillRect(330, r - 18, 400, 6);
    ctx.restore();
  };
  side(false);
  side(true);

  // "NSC" nas portas, legível dos dois lados (o 69 fica no teto, como no carro).
  const doorY = (L.beltY + L.rockerY) / 2 + 6;
  drawText(ctx, "NSC", L.doorX, doorY, 118, 0, L.white);
  drawText(ctx, "NSC", L.doorX, L.mirrorY - doorY, 118, Math.PI, L.white);

  // RODERA no capô (lida com a frente para baixo, como na miniatura) e o 69 no teto.
  drawText(ctx, "RODERA", 222, 388, 46, Math.PI / 2, L.white, false);
  drawText(ctx, "69", 650, 384, 96, Math.PI / 2, L.white);
  drawText(ctx, "RODERA", 925, 384, 40, -Math.PI / 2, L.white, false);
  return canvas;
}

/**
 * Compõe a plotagem sobre a textura original: onde a máscara é vermelha
 * (pintura), cor da plotagem × sombreado original; no resto, a textura original.
 */
async function paintLivery(L: Livery = LIVERY) {
  const [base, mask] = await Promise.all([
    loadImage("/modelo/2018_nissan_370z_nismo_ext_shiro_white.etc.png"),
    loadImage("/modelo/2018_nissan_370z_nismo_mask.etc.png"),
  ]);
  const read = (img: HTMLImageElement | HTMLCanvasElement) => {
    const c = document.createElement("canvas");
    c.width = c.height = 1024;
    const x = c.getContext("2d")!;
    x.drawImage(img, 0, 0, 1024, 1024);
    return x.getImageData(0, 0, 1024, 1024);
  };
  const b = read(base);
  const m = read(mask);
  const l = read(drawLivery(L));
  const out = new ImageData(1024, 1024);
  for (let i = 0; i < out.data.length; i += 4) {
    const paint =
      (m.data[i] ?? 0) > 128 && (m.data[i + 1] ?? 0) < 100 && (m.data[i + 2] ?? 0) < 100;
    if (paint) {
      const lum = ((b.data[i] ?? 0) + (b.data[i + 1] ?? 0) + (b.data[i + 2] ?? 0)) / 3;
      const shade = Math.min(1.12, lum / 222);
      out.data[i] = Math.min(255, (l.data[i] ?? 0) * shade);
      out.data[i + 1] = Math.min(255, (l.data[i + 1] ?? 0) * shade);
      out.data[i + 2] = Math.min(255, (l.data[i + 2] ?? 0) * shade);
    } else {
      out.data[i] = b.data[i] ?? 0;
      out.data[i + 1] = b.data[i + 1] ?? 0;
      out.data[i + 2] = b.data[i + 2] ?? 0;
    }
    out.data[i + 3] = 255;
  }
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1024;
  canvas.getContext("2d")!.putImageData(out, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  model?.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const mat = mesh.material as THREE.MeshPhongMaterial;
    if (mat.name === "phong3") {
      mat.map = tex;
      mat.needsUpdate = true;
    }
  });
  return canvas.toDataURL("image/png");
}

// ---------------------------------------------------------------------------
// Exportação: GLB enxuto, materiais PBR, centrado e apoiado no chão.
// ---------------------------------------------------------------------------

function downscale(texture: THREE.Texture, size: number) {
  const image = texture.image as HTMLImageElement | HTMLCanvasElement | undefined;
  if (!image || !("width" in image) || image.width <= size) return texture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  canvas.getContext("2d")!.drawImage(image, 0, 0, size, size);
  const small = new THREE.CanvasTexture(canvas);
  small.colorSpace = texture.colorSpace;
  small.wrapS = texture.wrapS;
  small.wrapT = texture.wrapT;
  return small;
}

function toPBR(old: THREE.MeshPhongMaterial): THREE.Material {
  const name = old.name;
  if (name === "phong3") {
    return new THREE.MeshPhysicalMaterial({
      name: "pintura_nsc",
      map: old.map,
      roughness: 0.34,
      metalness: 0.15,
      clearcoat: 1,
      clearcoatRoughness: 0.07,
    });
  }
  if (name === "WINDOWS") {
    return new THREE.MeshStandardMaterial({
      name: "vidro",
      color: 0x0b0e12,
      roughness: 0.04,
      metalness: 0.2,
      transparent: true,
      opacity: 0.55,
    });
  }
  if (name === "ReD_GLASS") {
    return new THREE.MeshStandardMaterial({
      name: "lanterna",
      color: 0x8a0a12,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
    });
  }
  if (name === "SURR_WINDOW")
    return new THREE.MeshStandardMaterial({ name, color: 0x050505, roughness: 0.6 });
  const keepFull = ["Lights", "Wheel", "Badges"].includes(name);
  const map = old.map ? (keepFull ? old.map : downscale(old.map, 512)) : null;
  const metal = name === "Wheel" || name === "ROTOR";
  return new THREE.MeshStandardMaterial({
    name,
    map,
    color: old.color,
    transparent: old.transparent,
    opacity: old.opacity,
    alphaTest: old.alphaTest,
    side: old.side,
    roughness: metal ? 0.35 : name === "NEUMA" ? 0.9 : 0.6,
    metalness: metal ? 0.75 : 0.05,
  });
}

async function exportGLB() {
  if (!model) throw new Error("modelo não carregado");
  const { GLTFExporter } = await import("three/examples/jsm/exporters/GLTFExporter.js");
  const { mergeVertices } = await import("three/examples/jsm/utils/BufferGeometryUtils.js");
  const remove: THREE.Object3D[] = [];
  const cache = new Map<THREE.Material, THREE.Material>();
  model.traverse((o) => {
    if (o.name.includes("BONNETCAM")) remove.push(o);
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    const convert = (m: THREE.Material) => {
      if (!cache.has(m)) cache.set(m, toPBR(m as THREE.MeshPhongMaterial));
      return cache.get(m)!;
    };
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(convert)
      : convert(mesh.material);
    const geometry = mesh.geometry;
    ["color", "uv1", "uv2", "skinIndex", "skinWeight"].forEach((attr) =>
      geometry.deleteAttribute(attr),
    );
    if (!geometry.groups.length) mesh.geometry = mergeVertices(geometry, 1e-4);
  });
  remove.forEach((o) => o.removeFromParent());

  // Centrado no chão, com a frente em +Z (como já vem).
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3());
  model.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
  model.updateMatrixWorld(true);

  const exporter = new GLTFExporter();
  const result = await exporter.parseAsync(model, {
    binary: true,
    onlyVisible: true,
    maxTextureSize: 1024,
  });
  const bytes = new Uint8Array(result as ArrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  return { base64: btoa(binary), bytes: bytes.length, size: size.toArray() };
}

Object.assign(window, {
  carro: {
    load,
    view,
    debugUV,
    uvBounds,
    paintLivery,
    exportGLB,
    LIVERY,
    THREE,
    scene,
    renderer,
    get model() {
      return model;
    },
  },
});
