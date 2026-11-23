// Fluxo real: começa no lobby e avança passo a passo até o fim, como na
// apresentação (a próxima cena é pré-montada e os shaders compilados antes).
// Mede travadas > 250 ms e em que cena/passo acontecem.
// Uso: com o servidor rodando, node scripts/sequencia.cjs
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:5180/";

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--ignore-gpu-blocklist"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto(`${BASE}?sala=SEQU`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.nsc);
  await page.waitForTimeout(8000); // tempo de lobby (pré-montagem da abertura)
  await page.evaluate(() => {
    window.__gaps = [];
    let last = performance.now();
    const loop = (now) => {
      const gap = now - last;
      last = now;
      if (gap > 250) {
        const s = window.nsc.director.state;
        window.__gaps.push(`${Math.round(gap)} ms na cena ${s.scene}.${s.step}`);
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  const total = await page.evaluate(async () =>
    (await import("/src/roteiro.ts")).CENAS.reduce((n, c) => n + c.passos.length, 0),
  );
  for (let i = 1; i < total; i++) {
    await page.evaluate(() => window.nsc.director.next());
    await page.waitForTimeout(500);
    await page.waitForFunction(() => window.nsc.director.settled, null, { timeout: 90000 });
    await page.waitForTimeout(2500); // tempo de fala
  }
  const final = await page.evaluate(() => window.nsc.director.state);
  console.log("chegou em", `${final.scene}.${final.step}`);
  console.log("travadas:", JSON.stringify(await page.evaluate(() => window.__gaps)));
  await browser.close();
})().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
