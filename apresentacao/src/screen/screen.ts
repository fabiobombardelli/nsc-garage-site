import "../styles/screen.css";
import { h, param } from "../dom";
import { CENAS, TOTAL_SEGUNDOS, relogio } from "../roteiro";
import { createSync, newSala, type Msg } from "../sync";
import { Director } from "./director";
import { GL } from "./gl";
import { loadCarModel } from "./lib/three-kit";
import { warmHeroVideo } from "./scenes/s02-nsc";
import { qrSvg } from "./qr";
import type { SceneContext } from "./scene";
import { SCENES } from "./scenes";
import { createStage } from "./stage";
import { createCurtain } from "./transitions";

const SALA_KEY = "nsc-apresentacao-sala";

function getSala(): string {
  const fromUrl = param("sala")
    ?.toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
  if (fromUrl) return fromUrl;
  try {
    const stored = sessionStorage.getItem(SALA_KEY);
    if (stored) return stored;
    const created = newSala();
    sessionStorage.setItem(SALA_KEY, created);
    return created;
  } catch {
    return newSala();
  }
}

/** A tela do projetor: palco, diretor, teclado e sincronização com os celulares. */
export function startScreen(app: HTMLElement) {
  document.body.classList.add("is-screen");
  const stage = createStage(app);
  const sala = getSala();
  const base = `${location.origin}${location.pathname}`;
  const presenterUrl = `${base}#/apresentador?sala=${sala}`;
  const gl = new GL(stage);

  // Quem está no celular (presence do canal).
  let presenters: string[] = [];
  const presenterListeners = new Set<(nomes: string[]) => void>();

  const ctx: SceneContext = {
    gl,
    sala,
    presenterUrl,
    presenters: () => presenters,
    onPresenters: (callback) => {
      presenterListeners.add(callback);
      return () => presenterListeners.delete(callback);
    },
  };

  const curtain = createCurtain(stage.overlayLayer);
  const director = new Director(SCENES, stage.sceneLayer, ctx, curtain, gl);

  // ---------- sincronização ----------
  const sync = createSync(sala, { role: "tela", nome: "Tela" });
  let lastCommand = 0;
  const sendState = () => sync.send({ t: "state", ...director.state });
  sync.onMessage((msg: Msg) => {
    if (msg.t === "hello") {
      sendState();
      return;
    }
    if (msg.t !== "cmd") return;
    const now = performance.now();
    if (now - lastCommand < 400) return;
    lastCommand = now;
    if (msg.a === "next") director.next();
    else if (msg.a === "prev") director.prev();
    else if (msg.a === "goto") director.goTo(msg.scene ?? 0, msg.step ?? 0);
  });
  sync.onPresence((list) => {
    presenters = list.filter((p) => p.role === "apresentador").map((p) => p.nome);
    presenterListeners.forEach((listener) => listener(presenters));
  });
  director.onChange(() => {
    sendState();
    updateTimer();
  });
  window.setInterval(sendState, 3000);

  // ---------- sobreposições: tela grafite, pareamento, cronômetro ----------
  const blackout = h("div", { class: "blackout", "aria-hidden": "true" });
  const pairQr = h("div", { class: "pair-qr" });
  const pair = h(
    "div",
    { class: "pair-overlay", "aria-hidden": "true" },
    h(
      "div",
      { class: "pair-card" },
      pairQr,
      h(
        "div",
        { class: "pair-text" },
        h("p", { class: "t-placa pair-label" }, "Celular do apresentador"),
        h("p", { class: "t-head pair-code" }, sala),
        h("p", { class: "pair-url" }, presenterUrl.replace(/^https?:\/\//, "")),
      ),
    ),
  );
  void qrSvg(presenterUrl).then((svg) => (pairQr.innerHTML = svg));
  const timerTotal = h("span", { class: "timer-total" });
  const timerScene = h("span", { class: "timer-scene" });
  const timerFps = h("span", { class: "timer-fps" });
  const timer = h(
    "div",
    { class: "timer", "aria-hidden": "true" },
    timerTotal,
    timerScene,
    timerFps,
  );
  stage.overlayLayer.append(blackout, pair, timer);

  function updateTimer() {
    const state = director.state;
    const cena = CENAS[state.scene];
    timerTotal.textContent = `${relogio((state.elapsed ?? 0) / 1000)} / ${relogio(TOTAL_SEGUNDOS)}`;
    timerScene.textContent = `${cena?.numero ?? 0} · ${cena?.titulo ?? ""} ${relogio(
      state.sceneElapsed / 1000,
    )} / ${relogio(cena?.segundos ?? 0)}`;
    timerFps.textContent = `${gl.fps} fps · ${gl.quality === "alta" ? "alta" : "baixa"} · sala ${sala}`;
  }
  window.setInterval(updateTimer, 500);

  // ---------- teclado (e passadores, que mandam PageUp/PageDown) ----------
  window.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key;
    if (["ArrowRight", "PageDown", " ", "Enter"].includes(key)) {
      event.preventDefault();
      director.next();
    } else if (["ArrowLeft", "PageUp", "Backspace"].includes(key)) {
      event.preventDefault();
      director.prev();
    } else if (key === "Home") {
      director.goTo(0);
    } else if (/^[0-9]$/.test(key)) {
      director.goTo(key === "0" ? 10 : Number(key));
    } else if (key === "f" || key === "F") {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen().catch(() => undefined);
    } else if (key === "b" || key === "B") {
      blackout.classList.toggle("is-on");
    } else if (key === "p" || key === "P") {
      pair.classList.toggle("is-on");
    } else if (key === "t" || key === "T") {
      timer.classList.toggle("is-on");
      updateTimer();
    } else if (key === "q" || key === "Q") {
      gl.setQuality(gl.quality === "alta" ? "baixa" : "alta");
      updateTimer();
    } else if (key === "r" || key === "R") {
      director.resetTimer();
    }
  });

  const startScene = Number(param("cena") ?? 0);
  const startStep = Number(param("passo") ?? 0);
  director.start(Number.isFinite(startScene) ? startScene : 0, startStep || 0);

  // Durante o lobby: aquece as cenas 3D (abertura, criação e encerramento)
  // com o carro já carregado. As cópias ficam montadas e escondidas até o
  // fim, para os programas da GPU continuarem em cache.
  const warmLayer = h("div", { class: "warm-layer", "aria-hidden": "true" });
  stage.sceneLayer.append(warmLayer);
  const limit = (promise: Promise<unknown>, ms: number) =>
    Promise.race([
      promise.catch(() => undefined),
      new Promise((resolve) => window.setTimeout(resolve, ms)),
    ]);
  window.setTimeout(async () => {
    // Cada etapa tem limite de tempo: internet lenta não pode travar o aquecimento.
    await limit(warmHeroVideo(warmLayer), 9000);
    await limit(loadCarModel(), 30000);
    for (const index of [1, 6, 10]) {
      const scene = SCENES[index]?.();
      if (!scene) continue;
      scene.el.classList.add("is-hidden");
      warmLayer.append(scene.el);
      scene.mount(ctx);
      if (scene.world) await limit(gl.warm(scene.world), 15000);
      await new Promise((resolve) => window.setTimeout(resolve, 300));
    }
    // Pronto para começar (os testes esperam por isto).
    document.documentElement.dataset.aquecido = "sim";
  }, 1500);
  if (param("cronometro") === "1") timer.classList.add("is-on");
  if (param("qualidade") === "baixa") gl.setQuality("baixa");

  // Para os testes automáticos (Playwright) e o ensaio pelo console.
  Object.assign(window, { nsc: { director, gl, sala } });
}
