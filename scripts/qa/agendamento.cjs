// Teclado e foco no sistema de agendamento: o fluxo inteiro feito só com o teclado.
// Confere o foco a cada etapa (WCAG 2.4.3), erros (3.3.1), troca de tela (título e foco),
// cancelamento com confirmação (3.3.4), o painel de acessibilidade (Esc devolve o foco)
// e o acesso ao painel da oficina.
// Uso: com o build servido (npm run build && npx vite preview --port 4173), rode
//   node scripts/qa/agendamento.cjs          (BASE=http://... para outro endereço)
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:4173/";
let failures = 0;
const ok = (cond, label) => {
  if (!cond) failures += 1;
  console.log((cond ? "  ✓ " : "  ✗ ") + label);
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const focused = () =>
    page.evaluate(() => {
      const el = document.activeElement;
      return {
        id: el?.id ?? "",
        name: el?.getAttribute("name") ?? "",
        text: (el?.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 80),
        tag: el?.tagName.toLowerCase() ?? "",
      };
    });
  /** Aperta Tab até o foco chegar no elemento que satisfaz `match` (no máximo 60 vezes). */
  const tabTo = async (match, label) => {
    for (let i = 0; i < 60; i += 1) {
      await page.keyboard.press("Tab");
      const f = await focused();
      if (match(f)) return f;
    }
    throw new Error(`Tab não chegou em: ${label}`);
  };
  const wait = (ms = 450) => page.waitForTimeout(ms);

  console.log("Agendar só com o teclado");
  await page.goto(BASE + "#/agendar", { waitUntil: "networkidle" });
  await tabTo((f) => f.name === "servico", "primeira opção de serviço");
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowDown");
  const chosen = await page.evaluate(
    () => document.querySelector('input[name="servico"]:checked')?.value,
  );
  ok(chosen === "motor", `setas trocam o serviço (escolhido: ${chosen})`);
  await tabTo((f) => f.text.startsWith("Continuar"), "Continuar");
  await page.keyboard.press("Enter");
  await wait();
  let f = await focused();
  ok(
    f.id === "etapa-titulo" && f.text.startsWith("Etapa 2 de 4"),
    `foco no título da etapa 2: "${f.text}"`,
  );

  await tabTo((f) => f.tag === "button" && f.text === "", "botão de semana");
  // O primeiro botão focável é "Próxima semana" (a anterior está desativada).
  await page.keyboard.press("Enter");
  await wait(250);
  await tabTo((f) => f.name === "dia", "dias");
  await page.keyboard.press("Space");
  await wait(250);
  await tabTo((f) => f.name === "horario", "horários");
  await page.keyboard.press("Space");
  const slot = await page.evaluate(
    () => document.querySelector('input[name="horario"]:checked')?.value,
  );
  ok(Boolean(slot), `horário escolhido pelo teclado: ${slot}`);
  await tabTo((f) => f.text.startsWith("Continuar"), "Continuar");
  await page.keyboard.press("Enter");
  await wait();
  f = await focused();
  ok(f.text.startsWith("Etapa 3 de 4"), `foco no título da etapa 3: "${f.text}"`);

  // Enviar vazio pelo Enter dentro do campo: o foco vai para o primeiro erro.
  await tabTo((f) => f.id === "ag-nome", "campo nome");
  await page.keyboard.press("Enter");
  await wait(250);
  f = await focused();
  const invalid = await page.getAttribute("#ag-nome", "aria-invalid");
  const described = await page.getAttribute("#ag-nome", "aria-describedby");
  ok(f.id === "ag-nome" && invalid === "true", "erro: foco volta ao nome, com aria-invalid");
  ok((described ?? "").includes("ag-nome-erro"), "erro ligado ao campo pelo aria-describedby");
  await page.keyboard.type("Teste Teclado");
  await page.keyboard.press("Tab");
  await page.keyboard.type("11 98765-1111");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.type("Toyota GR86");
  await tabTo((f) => f.id === "ag-consentimento", "consentimento");
  await page.keyboard.press("Space");
  await tabTo((f) => f.text.startsWith("Continuar"), "Continuar");
  await page.keyboard.press("Enter");
  await wait();
  f = await focused();
  ok(f.text.startsWith("Etapa 4 de 4"), `foco no título da revisão: "${f.text}"`);
  const phone = await page
    .locator(".review-row", { hasText: "Telefone" })
    .locator("dd")
    .first()
    .textContent();
  ok(phone === "(11) 98765-1111", `telefone arrumado ao sair do campo: ${phone}`);

  await tabTo((f) => f.text.startsWith("Confirmar agendamento"), "Confirmar");
  await page.keyboard.press("Enter");
  await wait(900);
  f = await focused();
  ok(f.id === "comprovante-titulo", `foco no comprovante: "${f.text}"`);
  const protocol = (await page.locator(".receipt-protocol-code").textContent()).trim();
  ok(/^NSC-[A-Z2-9]{6}$/.test(protocol), `protocolo gerado: ${protocol}`);

  console.log("Troca de tela");
  await tabTo((f) => f.text === "Acompanhar agendamento", "Acompanhar agendamento");
  await page.keyboard.press("Enter");
  await wait(700);
  f = await focused();
  ok(f.tag === "h1" && f.text === "Meus agendamentos", `foco no h1 da nova tela: "${f.text}"`);
  ok((await page.title()).startsWith("Meus agendamentos"), `título da aba: ${await page.title()}`);

  console.log("Consultar e cancelar");
  await tabTo((f) => f.text.startsWith("Ver agendamentos"), "Ver agendamentos");
  await page.keyboard.press("Enter");
  await wait(600);
  f = await focused();
  ok(f.id === "resultados-titulo", `foco nos resultados: "${f.text}"`);
  await tabTo((f) => f.text === "Cancelar agendamento", "Cancelar agendamento");
  await page.keyboard.press("Enter");
  await wait(300);
  f = await focused();
  ok(
    f.text.startsWith("Cancelar o agendamento de"),
    `confirmação recebe o foco: "${f.text.slice(0, 50)}…"`,
  );
  await tabTo((f) => f.text === "Sim, cancelar", "Sim, cancelar");
  await page.keyboard.press("Enter");
  await wait(600);
  f = await focused();
  const badge = await page.locator(".appointment-card .status-badge").first().textContent();
  ok(
    f.tag === "h3" && badge === "Cancelado",
    `cancelado; foco volta ao título do cartão (${badge})`,
  );

  console.log("Painel de acessibilidade");
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator(".a11y-toggle").focus();
  await page.keyboard.press("Enter");
  ok(
    (await page.getAttribute(".a11y-toggle", "aria-expanded")) === "true",
    "abre com Enter (aria-expanded)",
  );
  await tabTo((f) => f.name === "tamanho-texto", "tamanho do texto");
  await page.keyboard.press("ArrowRight");
  const scale = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--font-scale"),
  );
  ok(scale.trim() === "1.125", `seta aumenta o texto (--font-scale ${scale.trim()})`);
  await page.keyboard.press("Escape");
  f = await focused();
  ok(
    f.text === "Acessibilidade" &&
      (await page.getAttribute(".a11y-toggle", "aria-expanded")) === "false",
    "Esc fecha e devolve o foco ao botão",
  );
  await page.evaluate(() => localStorage.removeItem("nsc:acessibilidade"));

  console.log("Painel da oficina");
  await page.goto(BASE + "#/painel", { waitUntil: "networkidle" });
  await wait(700); // a troca de tela leva o foco ao h1 no quadro seguinte
  await tabTo((f) => f.id === "painel-senha", "senha");
  await page.keyboard.type("errada");
  await page.keyboard.press("Enter");
  await wait(300);
  f = await focused();
  ok(
    f.id === "painel-senha" &&
      (await page.getAttribute("#painel-senha", "aria-invalid")) === "true",
    "senha errada: erro e foco no campo",
  );
  await page.fill("#painel-senha", "oficina2026");
  await page.keyboard.press("Enter");
  await wait(500);
  f = await focused();
  ok(f.tag === "h1" && f.text === "Agenda da oficina", `entrou: foco no h1 "${f.text}"`);

  await browser.close();
  console.log(failures ? `\n${failures} falha(s)` : "\nTudo certo.");
  process.exit(failures ? 1 : 0);
})().catch((error) => {
  console.error("FALHOU:", error.message);
  process.exit(1);
});
