// Prepara o carro 3D: serve o FBX original (pasta passada no argumento) em
// /modelo/, abre tools/carro.html no servidor do Vite e executa um passo.
// Uso: node scripts/carro.cjs <pasta-do-fbx> <passo> [saida]
//   passo "inspecionar": lista malhas e materiais e salva vistas em PNG
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const [, , dir, step = "inspecionar", out = "."] = process.argv;
const BASE = process.env.BASE || "http://127.0.0.1:5180/";
const types = { ".png": "image/png", ".fbx": "application/octet-stream", ".jpg": "image/jpeg" };

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  page.on("pageerror", (e) => console.log("erro:", e.message));
  await page.route("**/modelo/**", (route) => {
    const name = decodeURIComponent(new URL(route.request().url()).pathname.split("/").pop());
    const file = path.join(dir, name);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: "" });
    route.fulfill({
      status: 200,
      body: fs.readFileSync(file),
      headers: { "content-type": types[path.extname(file)] || "application/octet-stream" },
    });
  });
  await page.goto(`${BASE}tools/carro.html`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.carro);
  const info = await page.evaluate(() => window.carro.load());
  if (step === "inspecionar") {
    console.log(
      "tamanho:",
      info.size.map((n) => n.toFixed(2)).join(" × "),
      "centro:",
      info.center.map((n) => n.toFixed(2)).join(", "),
    );
    info.meshes.forEach((m) => console.log(JSON.stringify(m)));
    for (const v of ["lado", "cima", "frente", "tres4"]) {
      await page.evaluate((v) => window.carro.view(v), v);
      await page.screenshot({ path: path.join(out, `carro-${v}.png`) });
    }
  }
  if (step === "uv") {
    const mat = process.env.MATERIAL;
    const bounds = await page.evaluate((m) => window.carro.uvBounds(m), mat);
    bounds.forEach((b) => console.log(JSON.stringify(b)));
    await page.evaluate((m) => window.carro.debugUV(m), mat);
    for (const v of ["lado", "outro", "cima", "frente", "tras"]) {
      await page.evaluate((v) => window.carro.view(v), v);
      await page.screenshot({ path: path.join(out, `uv-${v}.png`) });
    }
  }
  if (step === "plotagem") {
    const overrides = process.env.LIVERY ? JSON.parse(process.env.LIVERY) : {};
    const data = await page.evaluate(
      (o) => window.carro.paintLivery({ ...window.carro.LIVERY, ...o }),
      overrides,
    );
    fs.writeFileSync(path.join(out, "plotagem.png"), Buffer.from(data.split(",")[1], "base64"));
    for (const v of ["lado", "outro", "cima", "frente", "tras", "tres4"]) {
      await page.evaluate((v) => window.carro.view(v), v);
      await page.screenshot({ path: path.join(out, `pl-${v}.png`) });
    }
  }
  if (step === "exportar") {
    await page.evaluate(() => window.carro.paintLivery());
    const r = await page.evaluate(() => window.carro.exportGLB());
    const file = path.join(out, "carro-370z-nsc.glb");
    fs.writeFileSync(file, Buffer.from(r.base64, "base64"));
    console.log(
      "GLB:",
      file,
      (r.bytes / 1e6).toFixed(2),
      "MB; tamanho (m):",
      r.size.map((n) => n.toFixed(2)).join(" × "),
    );
    for (const v of ["lado", "outro", "cima", "frente", "tras", "tres4"]) {
      await page.evaluate((v) => window.carro.view(v), v);
      await page.screenshot({ path: path.join(out, `ex-${v}.png`) });
    }
  }
  await browser.close();
})().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
