// WCAG 1.4.12 (espaçamento de texto) e fonte 150% sem cortes, em todas as telas, quebras do
// slogan e 2.4.11 (foco não coberto pelo header). SKIP_FOCUS=1 pula o teste de foco.
// Uso: com o build servido (npm run build && npx vite preview --port 4173), rode
//   node scripts/qa/<arquivo>.cjs          (BASE=http://... para outro endereço)
// Requer o Playwright com Chromium (já instalado no ambiente de nuvem do Claude) e,
// no axe.cjs, o axe-core: npm i --no-save axe-core
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:4173/";
/** Telas testadas: a página inicial e as telas internas (o endereço vai depois do "#"). */
const ROUTES = [
  "",
  "#/agendar",
  "#/meus-agendamentos",
  "#/painel",
  "#/acessibilidade",
  "#/privacidade",
];
const SPACING = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`;
const findClipped = () => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const clipAncestors = (el) => {
    const list = [];
    for (let p = el; p && p !== document.documentElement; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(hidden|clip)/.test(cs.overflowX) || /(hidden|clip)/.test(cs.overflowY)) list.push(p);
    }
    return list;
  };
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent.trim();
    if (!text) continue;
    const el = node.parentElement;
    if (
      !el ||
      el.closest(
        '[aria-hidden="true"], [hidden], .sr-only-text, .access-shortcuts, script, style, noscript',
      )
    )
      continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    if (!rects.length) continue;
    const ancestors = clipAncestors(el);
    for (const r of rects) {
      let problem = null;
      if (r.right > vw + 1 || r.left < -1)
        problem = `sai da janela (${Math.round(r.left)}→${Math.round(r.right)} de ${vw})`;
      for (const a of ancestors) {
        if (problem) break;
        const ar = a.getBoundingClientRect();
        if (
          r.right > ar.right + 2 ||
          r.left < ar.left - 2 ||
          r.bottom > ar.bottom + 2 ||
          r.top < ar.top - 2
        )
          problem = `cortado por ${a.tagName}.${String(a.className).slice(0, 30)}`;
      }
      if (problem) {
        out.push(`"${text.slice(0, 28)}" ${problem}`);
        break;
      }
    }
  }
  return { hscroll: document.documentElement.scrollWidth - vw, clipped: [...new Set(out)] };
};
(async () => {
  const browser = await chromium.launch();
  // 0. medida normal: as frases do slogan e o nome cabem numa linha
  const page0 = await browser.newPage({ viewport: { width: 1920, height: 1000 } });
  await page0.goto(BASE + "?movimento=reduzido", { waitUntil: "networkidle" });
  const wraps = [];
  for (let w = 320; w <= 1920; w += 8) {
    await page0.setViewportSize({ width: w, height: 1000 });
    const r = await page0.evaluate(() => {
      const lines = (el) => {
        const rg = document.createRange();
        rg.selectNodeContents(el);
        return new Set(
          [...rg.getClientRects()].filter((x) => x.width > 0).map((x) => Math.round(x.top)),
        ).size;
      };
      return {
        hero: [...document.querySelectorAll(".hero-line .masked-line-inner")].map(lines),
        mark: lines(document.querySelector(".footer-wordmark")),
        chest: lines(document.querySelector(".tool-chest-title")),
      };
    });
    if ((w >= 640 && r.hero.some((n) => n > 1)) || r.mark > 1 || r.chest > 1)
      wraps.push(`${w}: slogan ${r.hero.join("/")} linhas, nome ${r.mark}, serviços ${r.chest}`);
  }
  console.log(`quebras indesejadas (320–1920): ${wraps.length}`);
  for (const x of wraps.slice(0, 10)) console.log("   ", x);
  await page0.close();
  // 1. WCAG 1.4.12 espaçamento de texto, também com fonte 150%, em cada tela
  for (const route of ROUTES)
    for (const query of ["?movimento=reduzido", "?movimento=reduzido&fonte=150"]) {
      for (const [w, h] of [
        [1920, 1080],
        [1440, 900],
        [1024, 768],
        [768, 1024],
        [390, 844],
        [320, 640],
      ]) {
        const page = await browser.newPage({ viewport: { width: w, height: h } });
        await page.goto(BASE + query + route, { waitUntil: "networkidle" });
        await page.addStyleTag({ content: SPACING });
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight / 2) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 60));
          }
          scrollTo(0, 0);
          await new Promise((r) => setTimeout(r, 300));
        });
        const r = await page.evaluate(findClipped);
        const head = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          return [
            ...document.querySelectorAll(".site-header-bar > *, .site-nav a, .site-header-action"),
          ]
            .filter((e) => e.offsetParent)
            .map((e) => e.getBoundingClientRect().right)
            .filter((x) => x > vw + 1).length;
        });
        if (head) console.log(`    header passa da janela: ${head} itens`);
        console.log(
          `${route || "#inicio"} ${query} ${w}x${h} hscroll=${r.hscroll} cortes=${r.clipped.length}`,
        );
        for (const c of r.clipped.slice(0, 8)) console.log("   ", c);
        await page.close();
      }
    }
  if (process.env.SKIP_FOCUS) {
    await browser.close();
    return;
  }
  // 2. WCAG 2.4.11 foco não encoberto pelo header
  for (const [w, h] of [
    [1440, 900],
    [390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const hidden = [];
    let total = 0;
    for (const dir of ["Tab", "Shift+Tab"]) {
      for (let i = 0; i < 70; i++) {
        await page.keyboard.press(dir);
        await page.waitForTimeout(220);
        const res = await page.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const header = document.querySelector(".site-header");
          const hr = header.getBoundingClientRect();
          const r = el.getBoundingClientRect();
          const exempt = header.contains(el) || el.closest(".mobile-menu, .access-shortcuts");
          return {
            covered: !exempt && hr.bottom > 0 && r.top >= hr.top - 1 && r.bottom <= hr.bottom + 1,
            label: (el.getAttribute("aria-label") || el.textContent || el.id).trim().slice(0, 40),
            top: Math.round(r.top),
            hb: Math.round(hr.bottom),
          };
        });
        if (res) total++;
        if (res && res.covered)
          hidden.push(`${dir} "${res.label}" top=${res.top} header até ${res.hb}`);
      }
    }
    console.log(`foco ${w}x${h}: ${total} paradas, encobertos=${hidden.length}`);
    for (const x of hidden.slice(0, 10)) console.log("   ", x);
    await page.close();
  }
  await browser.close();
})();
