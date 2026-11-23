// Captura cada passo de cada cena em 1920×1080 (para conferir o visual).
// Uso: com o servidor rodando, node scripts/capturar.cjs <pasta> [cenas, ex.: 2,3,4]
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const BASE = process.env.BASE || "http://127.0.0.1:5180/";
const out = process.argv[2] || "capturas";
const only = process.argv[3] ? process.argv[3].split(",").map(Number) : null;
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && !/supabase|WebSocket/.test(m.text())) errors.push(m.text());
  });
  await page.goto(`${BASE}?sala=CAPT`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.nsc);
  const settle = async (extra = 300) => {
    await page.waitForFunction(() => window.nsc.director.settled, null, { timeout: 60000 });
    await page.waitForTimeout(extra);
  };
  const scenes = await page.evaluate(async () =>
    (await import("/src/roteiro.ts")).CENAS.map((c) => c.passos.length),
  );
  for (let scene = 0; scene < scenes.length; scene++) {
    if (only && !only.includes(scene)) continue;
    await page.evaluate((n) => window.nsc.director.goTo(n), scene);
    await page.waitForTimeout(900);
    for (let step = 0; step < scenes[scene]; step++) {
      if (step > 0) {
        await page.evaluate(() => window.nsc.director.next());
        await page.waitForTimeout(100);
      }
      await settle(scene === 3 ? 2500 : 500);
      const file = path.join(out, `cena-${String(scene).padStart(2, "0")}-passo-${step + 1}.png`);
      await page.screenshot({ path: file });
      console.log(file);
    }
  }
  console.log("erros:", errors.length ? errors : "nenhum");
  await browser.close();
})().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
