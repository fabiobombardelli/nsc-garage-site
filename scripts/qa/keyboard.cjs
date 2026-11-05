// Teclado: atalhos eMAG, menu do celular (diálogo), gavetas (accordion) e formulário.
// Uso: com o build servido (npm run build && npx vite preview --port 4173), rode
//   node scripts/qa/<arquivo>.cjs          (BASE=http://... para outro endereço)
// Requer o Playwright com Chromium (já instalado no ambiente de nuvem do Claude) e,
// no axe.cjs, o axe-core: npm i --no-save axe-core
const { chromium } = require("playwright");
const BASE = process.env.BASE || "http://127.0.0.1:4173/";
const ok = (cond, label) => console.log((cond ? "  ✓ " : "  ✗ ") + label);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE, { waitUntil: "networkidle" });
  await p.evaluate(() => {
    window.__opened = [];
    window.open = (u) => {
      window.__opened.push(u);
      return null;
    };
  });
  const active = () =>
    p.evaluate(() => {
      const e = document.activeElement;
      return (
        (e.id ? "#" + e.id : e.tagName.toLowerCase()) +
        " " +
        (e.textContent || "").trim().slice(0, 40)
      );
    });

  console.log("Atalhos (eMAG)");
  await p.keyboard.press("Tab");
  const first = await p.evaluate(() => {
    const e = document.activeElement;
    const r = e.getBoundingClientRect();
    return {
      text: e.textContent.trim(),
      visible: r.top >= 0 && r.height > 0,
      accesskey: e.accessKey,
    };
  });
  ok(
    first.text.startsWith("Ir para o conteúdo") && first.visible && first.accesskey === "1",
    `1º Tab mostra "${first.text}" (accesskey ${first.accesskey})`,
  );
  await p.keyboard.press("Enter");
  await p.waitForTimeout(400);
  ok((await active()).startsWith("#conteudo"), "Enter leva o foco ao conteúdo principal");
  // O navegador de teste (sem interface) não processa accesskey; testamos o que ela faz: acionar o link.
  for (const [key, target] of [
    ["2", "#menu-principal"],
    ["3", "#contato"],
    ["4", "#rodape"],
  ]) {
    const link = p.locator(`.access-shortcuts a[accesskey="${key}"]`);
    await link.focus();
    await p.keyboard.press("Enter");
    await p.waitForTimeout(500);
    const a = await active();
    ok(
      (await link.count()) === 1 && a.startsWith(target),
      `Atalho ${key} (accesskey) leva a ${target} (foco em: ${a.split(" ")[0]})`,
    );
  }
  // Nas telas internas, conteúdo, menu e rodapé pulam dentro da própria tela (WCAG 2.4.1).
  // Troca só o hash (sem recarregar), para manter o que o teste instalou na página.
  await p.evaluate(() => {
    location.hash = "#/agendar";
  });
  await p.waitForTimeout(600);
  for (const [key, target] of [
    ["1", "#conteudo"],
    ["2", "#menu-principal"],
    ["4", "#rodape"],
  ]) {
    await p.locator(`.access-shortcuts a[accesskey="${key}"]`).focus();
    await p.keyboard.press("Enter");
    await p.waitForTimeout(400);
    const a = await active();
    const hash = await p.evaluate(() => location.hash);
    ok(
      hash === "#/agendar" && a.startsWith(target),
      `Em #/agendar, atalho ${key} fica na tela e leva a ${target} (hash ${hash}, foco em: ${a.split(" ")[0]})`,
    );
  }
  await p.evaluate(() => {
    location.hash = "#/";
  });
  await p.waitForTimeout(800);
  const hasFocusStyle = await p.evaluate(() => {
    const css = [...document.styleSheets]
      .flatMap((s) => {
        try {
          return [...s.cssRules].map((r) => r.cssText);
        } catch {
          return [];
        }
      })
      .join(" ");
    return css.includes(":focus-visible");
  });
  ok(hasFocusStyle, "Foco visível definido (:focus-visible)");

  console.log("Gavetas de serviços (accordion)");
  await p.evaluate(() => document.getElementById("servicos").scrollIntoView());
  const motor = p.locator("#gaveta-motor-botao");
  await motor.focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(700);
  ok(
    (await motor.getAttribute("aria-expanded")) === "true",
    "Enter abre a gaveta (aria-expanded=true)",
  );
  ok(
    await p.locator("#gaveta-drift").evaluate((e) => e.hidden),
    "A gaveta anterior fecha e sai da página (hidden)",
  );
  await p.keyboard.press("Space");
  await p.waitForTimeout(700);
  ok((await motor.getAttribute("aria-expanded")) === "false", "Espaço fecha a gaveta");

  console.log("Ordem de serviço");
  await p.evaluate(() => document.getElementById("contato").scrollIntoView());
  await p.locator(".work-order-submit").click();
  await p.waitForTimeout(300);
  ok((await active()).startsWith("#os-nome"), "Envio vazio leva o foco ao campo Nome");
  ok(
    (await p.locator("#os-nome").getAttribute("aria-invalid")) === "true",
    "Nome marcado com aria-invalid",
  );
  ok(
    (await p.locator("#os-nome").getAttribute("aria-describedby")) === "os-nome-erro",
    "Erro ligado ao campo (aria-describedby)",
  );
  ok(
    await p.locator("#os-nome-erro").isVisible(),
    `Mensagem: "${(await p.locator("#os-nome-erro").textContent()).trim()}"`,
  );
  await p.fill("#os-nome", "Fábio");
  await p.fill("#os-mensagem", "Revisão completa antes do track day.");
  await p.selectOption("#os-servico", "Manutenção premium");
  await p.locator(".work-order-submit").click();
  await p.waitForTimeout(300);
  const opened = await p.evaluate(() => window.__opened[0] || "");
  ok(
    opened.includes("wa.me") &&
      decodeURIComponent(opened.replace(/\+/g, " ")).includes("Manutenção premium"),
    "Envio válido abre o WhatsApp com a mensagem montada",
  );
  ok(
    await p.locator(".work-order-status a").isVisible(),
    "Aviso com link alternativo aparece (role=status)",
  );

  console.log("Menu do celular (diálogo)");
  await p.setViewportSize({ width: 390, height: 844 });
  await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(400);
  await p.locator(".menu-toggle").first().focus();
  await p.keyboard.press("Enter");
  await p.waitForTimeout(500);
  ok(
    await p.locator('#menu-mobile[role="dialog"][aria-modal="true"]').isVisible(),
    "Menu abre como diálogo modal",
  );
  for (let i = 0; i < 12; i++) await p.keyboard.press("Tab");
  ok(
    await p.evaluate(() => !!document.activeElement.closest("#menu-mobile")),
    "Tab fica preso dentro do menu",
  );
  await p.keyboard.press("Escape");
  await p.waitForTimeout(500);
  ok((await p.locator("#menu-mobile").count()) === 0, "Esc fecha o menu");
  ok(
    await p.evaluate(() => document.activeElement.classList.contains("menu-toggle")),
    "O foco volta ao botão Menu",
  );
  await b.close();
})();
