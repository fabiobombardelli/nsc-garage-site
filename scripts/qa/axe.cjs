// axe-core nos modos padrão, alto contraste, movimento reduzido e fonte 150% (1440 e 390 px).
// Uso: com o build servido (npm run build && npx vite preview --port 4173), rode
//   node scripts/qa/<arquivo>.cjs          (BASE=http://... para outro endereço)
// Requer o Playwright com Chromium (já instalado no ambiente de nuvem do Claude) e,
// no axe.cjs, o axe-core: npm i --no-save axe-core
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:4173/";
(async () => {
  const axePath = require.resolve("axe-core/axe.min.js");
  const b = await chromium.launch();
  const modes = [
    ["padrão", ""],
    ["alto contraste", "?contraste=alto"],
    ["movimento reduzido", "?movimento=reduzido"],
    ["fonte 150%", "?fonte=150"],
  ];
  for (const [label, query] of modes) {
    for (const vp of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const ctx = await b.newContext({ viewport: vp });
      const p = await ctx.newPage();
      await p.goto(BASE + query, { waitUntil: "networkidle" });
      await p.evaluate(() => document.fonts.ready);
      // percorre a página para todas as seções e entradas renderizarem
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < H; y += vp.height * 0.7) {
        await p.evaluate((y) => scrollTo(0, y), y);
        await p.waitForTimeout(90);
      }
      await p.waitForTimeout(1500);
      await p.evaluate(() => scrollTo(0, 0));
      await p.waitForTimeout(600);
      await p.addScriptTag({ path: axePath });
      const res = await p.evaluate(async () => {
        const r = await axe.run(document, {
          runOnly: {
            type: "tag",
            values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"],
          },
        });
        return {
          violations: r.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes
              .slice(0, 4)
              .map(
                (n) =>
                  n.target.join(" ") +
                  " :: " +
                  (n.failureSummary || "").split("\n").slice(1, 3).join(" "),
              ),
          })),
          incomplete: r.incomplete.map((v) => v.id + "(" + v.nodes.length + ")"),
          passes: r.passes.length,
        };
      });
      const sw = await p.evaluate(() => document.documentElement.scrollWidth);
      console.log(
        `\n=== ${label} @${vp.width}px — passes: ${res.passes}, violações: ${res.violations.length}, scrollWidth: ${sw}`,
      );
      for (const v of res.violations) {
        console.log(`  [${v.impact}] ${v.id}: ${v.help}`);
        v.nodes.forEach((n) => console.log("     - " + n.slice(0, 230)));
      }
      if (res.incomplete.length) console.log("  a revisar manualmente:", res.incomplete.join(", "));
      await ctx.close();
    }
  }
  await b.close();
})();
