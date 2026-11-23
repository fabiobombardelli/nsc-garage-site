// Checagem da fase 2: tela + celular (390×844) sincronizados.
// No mesmo navegador usa o BroadcastChannel; com o Supabase no ar, use
// SEPARADO=1 para abrir tela e celular em contextos diferentes (só internet).
// Uso: com o servidor rodando, node scripts/sincronia.cjs
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:5180/";
const SALA = "T" + Math.random().toString(36).slice(2, 6).toUpperCase();
const separate = process.env.SEPARADO === "1";

const ok = (cond, label) => console.log(`${cond ? "✓" : "✗"} ${label}`);

(async () => {
  const browser = await chromium.launch();
  const screenCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const phoneCtx = separate
    ? await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      })
    : screenCtx;
  const screen = await screenCtx.newPage();
  await screen.goto(`${BASE}?sala=${SALA}`, { waitUntil: "networkidle" });
  await screen.waitForFunction(() => window.nsc);

  const phone = await phoneCtx.newPage();
  if (!separate) await phone.setViewportSize({ width: 390, height: 844 });
  await phone.addInitScript(() => localStorage.setItem("nsc-apresentador-nome", "Cawan"));
  await phone.goto(`${BASE}#/apresentador?sala=${SALA}`, { waitUntil: "networkidle" });
  await phone.waitForFunction(
    () => document.querySelector(".p-status-text")?.textContent === "Tela conectada",
    null,
    { timeout: 15000 },
  );
  ok(true, "celular vê a tela conectada");

  const state = () => screen.evaluate(() => window.nsc.director.state);

  // Próximo no celular → tela muda em < 500 ms
  const before = await state();
  const t0 = Date.now();
  await phone.click(".p-footer .p-button-primary");
  await screen.waitForFunction(
    (b) => {
      const s = window.nsc.director.state;
      return s.scene !== b.scene || s.step !== b.step;
    },
    before,
    { timeout: 3000 },
  );
  const latency = Date.now() - t0;
  ok(latency < 500, `Próximo no celular troca a tela em ${latency} ms`);
  await screen.waitForTimeout(1200);

  // O celular mostra a cena da tela
  const title = await phone.textContent(".p-card-title");
  const s1 = await state();
  ok(
    title === "Abertura" && s1.scene === 1,
    `celular mostra "${title}" (tela na cena ${s1.scene})`,
  );

  // Dois toques quase juntos → só um avanço (proteção de 400 ms)
  const b2 = await state();
  await Promise.all([
    phone.click(".p-footer .p-button-primary"),
    phone.click(".p-footer .p-button-primary"),
  ]);
  await screen.waitForTimeout(1400);
  const a2 = await state();
  ok(
    a2.scene * 10 + a2.step - (b2.scene * 10 + b2.step) === 1,
    "dois toques juntos avançam um passo só",
  );

  // Voltar
  await phone.click(".p-footer .p-nav:not(.p-button-primary)");
  await screen.waitForTimeout(1200);
  const a3 = await state();
  ok(a3.scene === b2.scene && a3.step === b2.step, "Voltar no celular volta a tela");

  // Ir para… a cena do Neto
  await phone.click("text=Ir para…");
  await phone.click(".p-goto-item >> nth=3");
  await screen.waitForTimeout(1500);
  const a4 = await state();
  ok(a4.scene === 3, "Ir para… leva a tela à cena 3 (Neto)");
  const neto = await phone.isVisible(".p-neto");
  ok(neto, "celular mostra o cartão do Neto");
  await phone.screenshot({ path: process.env.SHOT || "celular-neto.png", fullPage: true });

  // Cena 4 é do Cawan; na 3 ele conduz: no 2 (Cawan) o aviso de próximo não aparece para ele
  await screen.keyboard.press("2");
  await screen.waitForTimeout(1500);
  const bannerOnTwo = await phone.isVisible(".p-banner");
  ok(!bannerOnTwo, "sem 'Você é o próximo' quando a parte atual já é sua");
  await screen.keyboard.press("1");
  await screen.waitForTimeout(1500);
  const bannerOnOne = await phone.isVisible(".p-banner");
  ok(bannerOnOne, "'Você é o próximo' aparece na Abertura para o Cawan");

  // Tela recarregada mantém a sala (sessionStorage) e o celular reconecta
  const noSala = await screenCtx.newPage();
  await noSala.goto(BASE, { waitUntil: "networkidle" });
  await noSala.waitForFunction(() => window.nsc);
  const salaA = await noSala.evaluate(() => window.nsc.sala);
  await noSala.reload({ waitUntil: "networkidle" });
  await noSala.waitForFunction(() => window.nsc);
  const salaB = await noSala.evaluate(() => window.nsc.sala);
  ok(salaA === salaB && /^[A-Z2-9]{4}$/.test(salaA), `recarregar a tela mantém a sala (${salaA})`);

  await browser.close();
})().catch((e) => {
  console.error("FALHOU:", e.message);
  process.exit(1);
});
