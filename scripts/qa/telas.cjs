// axe-core em cada estado das telas internas (agendamento, comprovante, consulta, avaliação,
// painel da oficina, painel de acessibilidade, declaração e privacidade), nos modos padrão, alto contraste,
// movimento reduzido e fonte 150%, em 1440 e 390 px.
// Uso: com o build servido (npm run build && npx vite preview --port 4173), rode
//   node scripts/qa/telas.cjs          (BASE=http://... para outro endereço)
// Requer o Playwright com Chromium e o axe-core: npm i --no-save axe-core
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:4173/";
const axePath = require.resolve("axe-core/axe.min.js");
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function audit(page, label, results) {
  await page.waitForTimeout(400);
  if (!(await page.evaluate(() => typeof window.axe !== "undefined"))) {
    await page.addScriptTag({ path: axePath });
  }
  const violations = await page.evaluate(async (tags) => {
    const r = await axe.run(document, { runOnly: { type: "tag", values: tags } });
    return r.violations.map(
      (v) =>
        `[${v.impact}] ${v.id}: ${v.nodes
          .slice(0, 3)
          .map((n) => n.target.join(" "))
          .join(" | ")}`,
    );
  }, TAGS);
  const scrollWidth = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  results.push({ label, violations, scrollWidth });
}

const next = (page) =>
  page.getByRole("button", { name: /^(Continuar|Confirmar agendamento)/ }).click();

(async () => {
  const browser = await chromium.launch();
  const modes = [
    ["padrão", ""],
    ["alto contraste", "?contraste=alto"],
    ["movimento reduzido", "?movimento=reduzido"],
    ["fonte 150%", "?fonte=150"],
  ];
  let total = 0;
  for (const [mode, query] of modes) {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const results = [];
      const go = async (hash) => {
        await page.goto(BASE + query + hash, { waitUntil: "networkidle" });
        await page.evaluate(() => document.fonts.ready);
      };

      // Agendar: etapa 1 vazia e com erro
      await go("#/agendar");
      await audit(page, "agendar · serviço", results);
      await next(page);
      await audit(page, "agendar · serviço com erro", results);
      await page.locator('input[name="servico"]').first().check({ force: true });
      await next(page);
      // Etapa 2: próxima semana (mais de 24 h à frente), dia e horário
      await page.getByRole("button", { name: "Próxima semana" }).click();
      await page.locator('input[name="dia"]:not([disabled])').first().check({ force: true });
      await page.locator('input[name="horario"]:not([disabled])').first().check({ force: true });
      await audit(page, "agendar · dia e horário", results);
      await next(page);
      // Etapa 3: erros e preenchida
      await next(page);
      await audit(page, "agendar · dados com erros", results);
      await page.fill("#ag-nome", "Teste Automático");
      await page.fill("#ag-telefone", "11987650000");
      await page.fill("#ag-carro", "Nissan 350Z");
      await page.check("#ag-consentimento", { force: true });
      await next(page);
      await audit(page, "agendar · revisão", results);
      await next(page);
      await page.waitForTimeout(900);
      await audit(page, "comprovante", results);
      const protocol = (await page.locator(".receipt-protocol-code").textContent()).trim();

      // Painel: erro de senha, entrada, exemplos, confirmar e concluir o agendamento criado
      await go("#/painel");
      await page.fill("#painel-senha", "errada");
      await page.getByRole("button", { name: /Entrar no painel/ }).click();
      await page.waitForTimeout(300);
      await audit(page, "painel · senha errada", results);
      await page.fill("#painel-senha", "oficina2026");
      await page.getByRole("button", { name: /Entrar no painel/ }).click();
      await page.getByRole("button", { name: "Carregar exemplos" }).first().click();
      await page.waitForTimeout(400);
      const item = page.locator("article.agenda-item", { hasText: protocol });
      await item.getByRole("button", { name: "Confirmar horário" }).click();
      await item.getByRole("button", { name: "Marcar como concluído" }).click();
      await audit(page, "painel · agenda", results);
      const exampleItem = page.locator("article.agenda-item", { hasText: "Ana Souza" });
      await exampleItem.getByRole("button", { name: "Cancelar agendamento" }).click();
      await audit(page, "painel · confirmação de cancelamento", results);

      // Consulta do cliente e avaliação
      await go(`#/meus-agendamentos?protocolo=${protocol}`);
      await audit(page, "meus agendamentos · consulta", results);
      await page.fill("#consulta-telefone", "11987650000");
      await page.getByRole("button", { name: /Ver agendamentos/ }).click();
      await page.waitForTimeout(400);
      await page.getByRole("button", { name: "Avaliar o atendimento" }).click();
      await page.getByRole("button", { name: "Enviar avaliação" }).click();
      await audit(page, "meus agendamentos · avaliação com erro", results);

      // Painel de acessibilidade e declaração
      await go("#/acessibilidade");
      await audit(page, "declaração de acessibilidade", results);
      await page.getByRole("button", { name: "Acessibilidade" }).click();
      await audit(page, "painel de acessibilidade aberto", results);
      await page.keyboard.press("Escape");

      // Aviso de privacidade (LGPD)
      await go("#/privacidade");
      await audit(page, "aviso de privacidade", results);

      const failing = results.filter((r) => r.violations.length || r.scrollWidth > 0);
      total += failing.reduce((sum, r) => sum + r.violations.length, 0);
      console.log(
        `\n=== ${mode} @${viewport.width}px — ${results.length} estados, ${failing.length} com problema`,
      );
      for (const r of failing) {
        console.log(`  ${r.label} (rolagem lateral: ${r.scrollWidth}px)`);
        r.violations.forEach((v) => console.log("     - " + v.slice(0, 220)));
      }
      await context.close();
    }
  }
  console.log(`\nTotal de violações: ${total}`);
  await browser.close();
})().catch((error) => {
  console.error("FALHOU:", error.message);
  process.exit(1);
});
