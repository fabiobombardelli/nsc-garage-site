/**
 * Vídeos ficam em `public/media/` (servidos como estão, sem passar pelo
 * bundler). Imagens comuns são importadas direto onde são usadas.
 */
const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

export type VideoSource = { src: string; type: string; media?: string };

export const heroVideo = {
  poster: media("hero-poster.webp"),
  /**
   * Ordem importa: o navegador usa a primeira fonte compatível.
   * Celulares recebem a versão 720p (mais leve); o MP4 atende
   * navegadores sem suporte a WebM.
   */
  sources: [
    { src: media("hero-drift-mobile.webm"), type: "video/webm", media: "(max-width: 767px)" },
    { src: media("hero-drift-mobile.mp4"), type: "video/mp4", media: "(max-width: 767px)" },
    { src: media("hero-drift.webm"), type: "video/webm" },
    { src: media("hero-drift.mp4"), type: "video/mp4" },
  ] satisfies VideoSource[],
};

/** Trecho de 2 s do 350Z de lado, exibido dentro do título da Trajetória. */
export const slideLoop = {
  poster: media("slide-loop-poster.webp"),
  sources: [
    { src: media("slide-loop.webm"), type: "video/webm" },
    { src: media("slide-loop.mp4"), type: "video/mp4" },
  ] satisfies VideoSource[],
};
