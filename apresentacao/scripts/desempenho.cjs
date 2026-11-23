// Fase 4: quadros por segundo e travadas (> 250 ms) em cada cena, passo a passo,
// com qualidade alta. Também vai e volta 5 vezes nas cenas 3D e compara a memória.
// Uso: com o servidor rodando, node scripts/desempenho.cjs [cenas, ex.: 1,6,10]
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:5180/";
const only = process.argv[2] ? process.argv[2].split(",").map(Number) : null;

(async () => {
  const browser = await chromium.launch({
    args: ["--use-gl=angle", "--ignore-gpu-blocklist", "--enable-precise-memory-info"],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`${BASE}?sala=PERF`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.nsc);
  await page.evaluate(() => {
    window.__gaps = [];
    window.__fps = [];
    let last = performance.now();
    const loop = (now) => {
      const gap = now - last;
      last = now;
      if (gap > 250) window.__gaps.push(Math.round(gap));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    setInterval(() => window.nsc.gl.fps && window.__fps.push(window.nsc.gl.fps), 500);
  });
  const steps = await page.evaluate(async () =>
    (await import("/src/roteiro.ts")).CENAS.map((c) => c.passos.length),
  );
  for (let scene = 1; scene < steps.length; scene++) {
    if (only && !only.includes(scene)) continue;
    await page.evaluate(() => {
      window.__gaps = [];
      window.__fps = [];
    });
    await page.evaluate((n) => window.nsc.director.goTo(n), scene);
    for (let step = 0; step < steps[scene]; step++) {
      if (step > 0) await page.evaluate(() => window.nsc.director.next());
      await page.waitForTimeout(400);
      await page.waitForFunction(() => window.nsc.director.settled, null, { timeout: 60000 });
      await page.waitForTimeout(1500);
    }
    const r = await page.evaluate(() => ({ gaps: window.__gaps, fps: window.__fps }));
    const fps = r.fps.length ? Math.min(...r.fps) + "–" + Math.max(...r.fps) : "2D";
    console.log(
      `cena ${scene}: fps ${fps}; travadas > 250 ms: ${r.gaps.length ? r.gaps.join(", ") : "nenhuma"}`,
    );
  }

  // Vazamento: ir e voltar 5 vezes entre as cenas 3D.
  const heap = () => page.evaluate(() => performance.memory?.usedJSHeapSize ?? 0);
  const glInfo = () => page.evaluate(() => window.nsc.gl.info());
  await page.evaluate(() => window.nsc.director.goTo(1));
  await page.waitForTimeout(3000);
  const before = { heap: await heap(), gl: await glInfo() };
  for (let i = 0; i < 5; i++) {
    for (const n of [6, 10, 1]) {
      await page.evaluate((n) => window.nsc.director.goTo(n), n);
      await page.waitForTimeout(1800);
    }
  }
  await page.waitForTimeout(3000);
  const after = { heap: await heap(), gl: await glInfo() };
  console.log(
    "memória JS (MB):",
    (before.heap / 1e6).toFixed(1),
    "→",
    (after.heap / 1e6).toFixed(1),
  );
  console.log("GPU antes:", JSON.stringify(before.gl), "depois:", JSON.stringify(after.gl));
  await browser.close();
})().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
