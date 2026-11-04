/**
 * Mídias pesadas ficam em `public/media/` (servidas como estão, sem passar
 * pelo bundler). Imagens comuns são importadas direto nos componentes.
 */
const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

export const heroVideo = {
  poster: media("hero-poster.webp"),
  /**
   * Ordem importa: o navegador usa a primeira fonte compatível.
   * Celulares recebem a versão 720p (mais leve); o MP4 atende
   * navegadores sem suporte a WebM (iPhones antigos).
   */
  sources: [
    { src: media("hero-drift-mobile.webm"), type: "video/webm", media: "(max-width: 767px)" },
    { src: media("hero-drift-mobile.mp4"), type: "video/mp4", media: "(max-width: 767px)" },
    { src: media("hero-drift.webm"), type: "video/webm" },
    { src: media("hero-drift.mp4"), type: "video/mp4" },
  ],
} as const;
