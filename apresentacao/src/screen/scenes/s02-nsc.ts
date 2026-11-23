import "./s02-nsc.css";
import poster from "@media/hero-poster.webp?url";
import videoMp4 from "@media/hero-drift.mp4?url";
import videoWebm from "@media/hero-drift.webm?url";
import { h, maskLine } from "../../dom";
import { Scene } from "../scene";

const NO_VIDEO = new URLSearchParams(location.search).get("video") === "0";
let heroVideo: HTMLVideoElement | null = null;

/**
 * Um único elemento de vídeo para a apresentação inteira: aquecido em
 * silêncio no lobby (o decodificador já fica pronto) e reaproveitado pela
 * cena. Iniciar um vídeo 1080p na hora da troca de cena travava a tela.
 * Com ?video=0, só a imagem de capa (reserva para notebook fraco).
 */
function getHeroVideo(): HTMLVideoElement {
  if (heroVideo) return heroVideo;
  heroVideo = h(
    "video",
    {
      class: "nsc-video",
      muted: true,
      loop: true,
      playsinline: true,
      preload: "auto",
      poster,
      "aria-hidden": "true",
    },
    ...(NO_VIDEO
      ? []
      : [
          h("source", { src: videoWebm, type: "video/webm" }),
          h("source", { src: videoMp4, type: "video/mp4" }),
        ]),
  );
  heroVideo.muted = true;
  return heroVideo;
}

/** Toca o vídeo escondido por um instante, para o decodificador iniciar antes da cena. */
export async function warmHeroVideo(parent: HTMLElement) {
  if (NO_VIDEO) return;
  const video = getHeroVideo();
  if (!video.isConnected) {
    video.classList.add("is-warming");
    parent.append(video);
  }
  try {
    await video.play();
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
  } catch {
    // Sem autoplay: a cena tenta de novo ao entrar.
  }
  if (video.classList.contains("is-warming")) video.pause();
}

/** Quem é a NSC: o vídeo do topo do site e o que a sigla quer dizer. */
export class NscScene extends Scene {
  readonly steps = 1;
  private video!: HTMLVideoElement;

  constructor() {
    super("scene-nsc");
  }

  protected build() {
    this.video = getHeroVideo();
    this.video.classList.remove("is-warming");
    const letters = h(
      "p",
      { class: "nsc-full t-placa", "aria-label": "Neto Street Car" },
      ...Array.from("Neto Street Car", (char) =>
        h("span", { class: "nsc-char", "aria-hidden": "true" }, char === " " ? " " : char),
      ),
    );
    this.el.append(
      this.video,
      h("div", { class: "nsc-scrim", "aria-hidden": "true" }),
      h("h1", { class: "nsc-big t-monument" }, maskLine("NSC")),
      letters,
    );

    this.tl
      .from(
        this.q(".nsc-big .mask-inner"),
        { yPercent: 150, duration: 1.1, ease: "expo.out" },
        0.15,
      )
      .from(
        this.q(".nsc-char"),
        { y: 60, opacity: 0, duration: 0.6, stagger: 0.045, ease: "power3.out" },
        0.6,
      );
    this.mark();
  }

  activate() {
    if (NO_VIDEO) return;
    void this.video.play().catch(() => undefined);
    this.onCleanup(() => this.video.pause());
  }
}
