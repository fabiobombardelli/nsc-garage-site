import "./presenter.css";
import { h, param } from "../dom";
import {
  CENAS,
  INTEGRANTES,
  TOTAL_SEGUNDOS,
  relogio,
  responsavel,
  type Cena,
  type Integrante,
} from "../roteiro";
import { createSync, type Msg, type SyncStatus } from "../sync";

const NOME_KEY = "nsc-apresentador-nome";
/** Sem estado da tela há mais que isso: considera desconectada. */
const SCREEN_TIMEOUT = 7000;

type Position = { scene: number; step: number };
type ScreenState = Extract<Msg, { t: "state" }> & { receivedAt: number };

function readNome(): Integrante | "ouvinte" | null {
  try {
    const value = localStorage.getItem(NOME_KEY);
    if (value === "ouvinte") return value;
    return INTEGRANTES.some((i) => i.id === value) ? (value as Integrante) : null;
  } catch {
    return null;
  }
}

function saveNome(value: Integrante | "ouvinte") {
  try {
    localStorage.setItem(NOME_KEY, value);
  } catch {
    // Navegação privada: vale só nesta visita.
  }
}

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Sem vibração (iPhone): só o aviso visual.
  }
}

/**
 * Versão do apresentador, no celular de cada integrante: quem fala, os
 * pontos da fala, quando passar a palavra ao Neto e os botões para avançar
 * a apresentação. Sem a tela conectada, funciona como roteiro.
 */
export function startPresenter(app: HTMLElement) {
  document.body.classList.add("is-presenter");
  const sala = param("sala")
    ?.toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  if (!sala) {
    renderSalaForm(app);
    return;
  }
  const nome = readNome();
  if (!nome) {
    renderChooser(app, (chosen) => {
      saveNome(chosen);
      app.replaceChildren();
      runPresenter(app, sala, chosen);
    });
    return;
  }
  runPresenter(app, sala, nome);
}

function renderSalaForm(app: HTMLElement) {
  const input = h("input", {
    id: "sala",
    class: "p-input",
    inputmode: "text",
    autocomplete: "off",
    autocapitalize: "characters",
    maxlength: 8,
    required: true,
  });
  const form = h(
    "form",
    { class: "p-setup" },
    h("h1", { class: "p-setup-title" }, "Apresentação NSC Garage"),
    h("label", { for: "sala", class: "p-label" }, "Código da sala (aparece na tela)"),
    input,
    h("button", { class: "p-button p-button-primary", type: "submit" }, "Entrar"),
  );
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const code = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code) location.hash = `#/apresentador?sala=${code}`;
    location.reload();
  });
  app.append(form);
  input.focus();
}

function renderChooser(app: HTMLElement, onChoose: (nome: Integrante | "ouvinte") => void) {
  const buttons = INTEGRANTES.map((integrante) => {
    const button = h("button", { class: "p-button p-choice", type: "button" }, integrante.nome);
    button.addEventListener("click", () => onChoose(integrante.id));
    return button;
  });
  const listen = h(
    "button",
    { class: "p-button p-choice p-choice-quiet", type: "button" },
    "Só acompanhar",
  );
  listen.addEventListener("click", () => onChoose("ouvinte"));
  app.append(
    h(
      "div",
      { class: "p-setup" },
      h("h1", { class: "p-setup-title" }, "Quem é você?"),
      h(
        "p",
        { class: "p-setup-help" },
        "Suas partes ficam destacadas e o celular avisa quando for a sua vez.",
      ),
      ...buttons,
      listen,
    ),
  );
}

function runPresenter(app: HTMLElement, sala: string, nome: Integrante | "ouvinte") {
  const me = nome === "ouvinte" ? null : nome;
  const meName = INTEGRANTES.find((i) => i.id === me)?.nome ?? "Ouvinte";
  const sync = createSync(sala, { role: "apresentador", nome: meName });

  let screen: ScreenState | null = null;
  let local: Position = { scene: 0, step: 0 };
  let localStartedAt: number | null = null;
  let localSceneAt = Date.now();
  let status: SyncStatus = sync.status;
  let wasNext = false;
  let warnedFor = "";
  let pendingSince = 0;

  // ---------- estrutura ----------
  const dot = h("span", { class: "p-dot", "aria-hidden": "true" });
  const statusText = h("span", { class: "p-status-text" });
  const total = h("span", { class: "p-total" });
  const changeName = h(
    "button",
    { class: "p-link", type: "button" },
    me ? meName.split(" ")[0] : "Ouvinte",
  );
  const gotoButton = h(
    "button",
    { class: "p-link", type: "button", "aria-expanded": "false" },
    "Ir para…",
  );
  const header = h(
    "header",
    { class: "p-header" },
    h("div", { class: "p-status" }, dot, statusText),
    h("div", { class: "p-meta" }, h("span", { class: "p-sala" }, `Sala ${sala}`), total),
    h("div", { class: "p-actions" }, changeName, gotoButton),
  );
  const nextBanner = h("div", { class: "p-banner", hidden: true }, "Você é o próximo");
  const live = h("p", { class: "p-live", role: "status" });
  const current = h("article", { class: "p-card" });
  const upcoming = h("p", { class: "p-upcoming" });
  const list = h("nav", { class: "p-goto", hidden: true, "aria-label": "Ir para uma cena" });
  const main = h("main", { class: "p-main" }, nextBanner, current, upcoming, live);
  const prev = h("button", { class: "p-button p-nav", type: "button" }, "◀ Voltar");
  const next = h(
    "button",
    { class: "p-button p-nav p-button-primary", type: "button" },
    "Próximo ▶",
  );
  const footer = h("footer", { class: "p-footer" }, prev, next);
  app.append(header, list, main, footer);

  // Lista "Ir para…"
  CENAS.forEach((cena, index) => {
    const quem = responsavel(cena);
    const button = h(
      "button",
      { class: `p-goto-item${quem && quem === me ? " is-mine" : ""}`, type: "button" },
      h("span", { class: "p-goto-num" }, String(cena.numero)),
      h("span", {}, cena.titulo),
      h("span", { class: "p-goto-who" }, cena.quem === "Neto" ? "Neto" : (cena.quem ?? "")),
    );
    button.addEventListener("click", () => {
      command({ t: "cmd", a: "goto", scene: index, step: 0 });
      toggleList(false);
    });
    list.append(button);
  });
  const toggleList = (open = list.hidden) => {
    list.hidden = !open;
    gotoButton.setAttribute("aria-expanded", String(open));
  };
  gotoButton.addEventListener("click", () => toggleList());
  changeName.addEventListener("click", () => {
    try {
      localStorage.removeItem(NOME_KEY);
    } catch {
      // ignora
    }
    location.reload();
  });

  // ---------- comandos ----------
  const connected = () => screen !== null && performance.now() - screen.receivedAt < SCREEN_TIMEOUT;

  function command(msg: Extract<Msg, { t: "cmd" }>) {
    vibrate(12);
    if (connected()) {
      sync.send({ ...msg, by: meName });
      pendingSince = performance.now();
      render();
      return;
    }
    // Sem a tela: navega só no roteiro.
    if (msg.a === "next") local = stepBy(local, 1);
    else if (msg.a === "prev") local = stepBy(local, -1);
    else local = { scene: msg.scene ?? 0, step: 0 };
    localSceneAt = Date.now();
    if (local.scene > 0 && localStartedAt === null) localStartedAt = Date.now();
    render();
  }

  const press = (button: HTMLButtonElement, msg: Extract<Msg, { t: "cmd" }>) => {
    button.addEventListener("click", () => {
      button.classList.add("is-pressed");
      window.setTimeout(() => button.classList.remove("is-pressed"), 160);
      command(msg);
    });
  };
  press(next, { t: "cmd", a: "next" });
  press(prev, { t: "cmd", a: "prev" });

  // ---------- sincronização ----------
  sync.onMessage((msg) => {
    if (msg.t !== "state") return;
    const changed = !screen || screen.scene !== msg.scene || screen.step !== msg.step;
    screen = { ...msg, receivedAt: performance.now() };
    local = { scene: msg.scene, step: msg.step };
    pendingSince = 0;
    if (changed) render();
  });
  sync.onStatus((next) => {
    status = next;
    if (next === "online") sync.send({ t: "hello", by: meName });
    render();
  });
  sync.send({ t: "hello", by: meName });
  window.setInterval(() => {
    if (!connected()) sync.send({ t: "hello", by: meName });
  }, 2000);

  // ---------- tela sempre acesa ----------
  let wakeLock: { release(): Promise<void> } | null = null;
  const keepAwake = async () => {
    try {
      const nav = navigator as Navigator & {
        wakeLock?: { request(type: "screen"): Promise<{ release(): Promise<void> }> };
      };
      if (nav.wakeLock && document.visibilityState === "visible") {
        wakeLock = await nav.wakeLock.request("screen");
      }
    } catch {
      wakeLock = null;
    }
  };
  void keepAwake();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && !wakeLock) void keepAwake();
  });
  document.addEventListener("click", () => {
    if (!wakeLock) void keepAwake();
  });

  // ---------- desenho ----------
  function position(): Position {
    return connected() && screen ? { scene: screen.scene, step: screen.step } : local;
  }

  function times() {
    if (connected() && screen) {
      const since = performance.now() - screen.receivedAt;
      return {
        elapsed: screen.elapsed === null ? 0 : screen.elapsed + since,
        sceneElapsed: screen.sceneElapsed + since,
      };
    }
    return {
      elapsed: localStartedAt === null ? 0 : Date.now() - localStartedAt,
      sceneElapsed: Date.now() - localSceneAt,
    };
  }

  function render() {
    const { scene, step } = position();
    const cena = CENAS[scene] ?? CENAS[0];
    const seguinte = CENAS[scene + 1];
    if (!cena) return;

    // Status
    const isConnected = connected();
    dot.dataset.state = isConnected ? "on" : status === "online" ? "wait" : "off";
    statusText.textContent = isConnected
      ? "Tela conectada"
      : status === "online"
        ? "Procurando a tela…"
        : status === "conectando"
          ? "Conectando…"
          : "Sem conexão: modo roteiro";
    if (pendingSince && performance.now() - pendingSince > 1500) {
      statusText.textContent = "Sem resposta da tela";
    }

    // Você é o próximo
    const mine = responsavel(cena) === me && me !== null;
    const isNext = me !== null && !mine && responsavel(seguinte) === me;
    nextBanner.hidden = !isNext;
    if (isNext && !wasNext) vibrate([180, 80, 180]);
    wasNext = isNext;

    current.className = `p-card${mine ? " is-mine" : ""}${cena.neto ? " is-neto" : ""}`;
    current.replaceChildren(...cardContent(cena, step, mine));
    upcoming.replaceChildren(
      ...(seguinte
        ? [
            h("span", { class: "p-upcoming-label" }, "Depois: "),
            `${seguinte.numero} · ${seguinte.titulo} — ${seguinte.quem === "Neto" ? `Neto (${seguinte.conduz} conduz)` : seguinte.quem}`,
          ]
        : ["Última parte. Depois, perguntas."]),
    );
    live.textContent = `Cena ${cena.numero}, ${cena.titulo}. Passo ${step + 1} de ${cena.passos.length}.`;
    prev.disabled = scene === 0 && step === 0;
    next.disabled = scene === CENAS.length - 1 && step === cena.passos.length - 1;
    tick();
  }

  function cardContent(cena: Cena, step: number, mine: boolean): Node[] {
    const isNeto = cena.quem === "Neto";
    const quem = cena.quem === null ? "Todos" : cena.quem;
    const sub = isNeto
      ? mine
        ? "Você conduz"
        : `${cena.conduz} conduz`
      : mine
        ? "É a sua vez"
        : "";
    const nodes: Node[] = [
      h(
        "div",
        { class: "p-card-top" },
        h(
          "span",
          { class: "p-card-num" },
          cena.numero === 0 ? "Antes de começar" : `Parte ${cena.numero}`,
        ),
        h("span", { class: "p-card-time" }, cena.segundos ? relogio(cena.segundos) : ""),
      ),
      h("h2", { class: "p-card-title" }, cena.titulo),
      h("p", { class: "p-card-who" }, quem),
    ];
    if (sub) nodes.push(h("p", { class: "p-card-sub" }, sub));
    nodes.push(
      h("div", { class: "p-bar", role: "presentation" }, h("span", { class: "p-bar-fill" })),
    );

    if (cena.neto) {
      nodes.push(
        h(
          "section",
          { class: "p-neto" },
          h("p", { class: "p-neto-call" }, "Passe a palavra para o Neto"),
          h("p", { class: "p-neto-line" }, `“${cena.neto.entrada}”`),
          h("p", { class: "p-neto-sub" }, "Se ele precisar de deixa:"),
          h("ol", { class: "p-neto-list" }, ...cena.neto.perguntas.map((q) => h("li", {}, q))),
          h("p", { class: "p-neto-warn", hidden: true }, "Hora de agradecer"),
          h("p", { class: "p-neto-sub" }, "Para retomar:"),
          h("p", { class: "p-neto-line" }, `“${cena.neto.volta}”`),
        ),
      );
    }

    nodes.push(
      h(
        "ol",
        { class: "p-steps" },
        ...cena.passos.map((passo, index) =>
          h(
            "li",
            {
              class: `p-step${index < step ? " is-done" : ""}${index === step ? " is-current" : ""}`,
              "aria-current": index === step ? "step" : undefined,
            },
            h("span", { class: "p-step-num" }, index < step ? "✓" : String(index + 1)),
            passo,
          ),
        ),
      ),
      h("ul", { class: "p-points" }, ...cena.pontos.map((ponto) => h("li", {}, ponto))),
    );
    if (cena.passa) {
      nodes.push(
        h(
          "p",
          { class: "p-pass" },
          h("span", { class: "p-pass-label" }, "Passa a vez: "),
          cena.passa,
        ),
      );
    }
    return nodes;
  }

  /** Atualiza só os relógios (a cada meio segundo). */
  function tick() {
    const { scene } = position();
    const cena = CENAS[scene];
    const { elapsed, sceneElapsed } = times();
    total.textContent = `${relogio(elapsed / 1000)} / ${relogio(TOTAL_SEGUNDOS)}`;
    const fill = current.querySelector<HTMLElement>(".p-bar-fill");
    if (cena && fill) {
      const ratio = cena.segundos ? sceneElapsed / 1000 / cena.segundos : 0;
      fill.style.width = `${Math.min(100, ratio * 100)}%`;
      fill.parentElement?.classList.toggle("is-over", ratio > 1);
    }
    const warn = current.querySelector<HTMLElement>(".p-neto-warn");
    if (cena?.neto && warn) {
      const show = sceneElapsed / 1000 >= cena.neto.avisoEm;
      warn.hidden = !show;
      if (show && warnedFor !== cena.id && responsavel(cena) === me) {
        warnedFor = cena.id;
        vibrate([300, 120, 300]);
      }
    } else if (!cena?.neto) {
      warnedFor = "";
    }
    if (!connected() && screen && status === "online") {
      dot.dataset.state = "wait";
    }
  }

  render();
  window.setInterval(() => {
    tick();
    // Atualiza o status quando a tela some ou volta.
    const isConnected = connected();
    if ((dot.dataset.state === "on") !== isConnected) render();
  }, 500);
}

/** Avança ou volta um passo no roteiro (modo sem tela). */
function stepBy(position: Position, delta: 1 | -1): Position {
  const cena = CENAS[position.scene];
  if (!cena) return { scene: 0, step: 0 };
  if (delta === 1) {
    if (position.step < cena.passos.length - 1)
      return { scene: position.scene, step: position.step + 1 };
    if (position.scene < CENAS.length - 1) return { scene: position.scene + 1, step: 0 };
    return position;
  }
  if (position.step > 0) return { scene: position.scene, step: position.step - 1 };
  if (position.scene > 0) {
    const previous = CENAS[position.scene - 1];
    return { scene: position.scene - 1, step: (previous?.passos.length ?? 1) - 1 };
  }
  return position;
}
