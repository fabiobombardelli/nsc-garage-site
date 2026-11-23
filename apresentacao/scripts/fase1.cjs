// Checagem da fase 1: navegação pelo teclado de S0 a S10 e soma dos tempos.
// Uso: com o servidor rodando (npx vite --port 5180), node scripts/fase1.cjs
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:5180/";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForFunction(() => window.nsc);

  const total = await page.evaluate(async () => {
    const mod = await import("/src/roteiro.ts");
    return { total: mod.TOTAL_SEGUNDOS, passos: mod.CENAS.map((c) => c.passos.length) };
  });
  console.log("soma dos tempos:", total.total, total.total === 600 ? "✓" : "✗");

  const expected = total.passos.reduce((a, b) => a + b, 0);
  const visited = [];
  for (let i = 0; i < expected + 2; i++) {
    const state = await page.evaluate(() => window.nsc.director.state);
    visited.push(`${state.scene}.${state.step}`);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(950);
  }
  const final = await page.evaluate(() => window.nsc.director.state);
  console.log("visitados:", visited.join(" "));
  console.log(
    "chegou na cena 10, último passo:",
    final.scene === 10 && final.step === 1 ? "✓" : "✗",
  );

  // Voltar tudo
  for (let i = 0; i < expected + 2; i++) {
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(820);
  }
  const back = await page.evaluate(() => window.nsc.director.state);
  console.log("voltou ao lobby:", back.scene === 0 && back.step === 0 ? "✓" : "✗");

  // Pular por número
  await page.keyboard.press("5");
  await page.waitForTimeout(1000);
  const jump = await page.evaluate(() => window.nsc.director.state);
  console.log("tecla 5 vai para a cena 5:", jump.scene === 5 ? "✓" : "✗");
  console.log("erros no console:", errors.length ? errors : "nenhum ✓");
  await browser.close();
})().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
