/**
 * Mídias pesadas ficam em `public/media/` (servidas como estão, sem passar
 * pelo bundler). Imagens comuns são importadas direto nos componentes.
 */
export const heroVideo = {
  webm: "/media/hero-drift.webm",
  /** Versão MP4 para navegadores que não reproduzem WebM (iPhones antigos). */
  mp4: "/media/hero-drift.mp4",
  poster: "/media/hero-poster.webp",
} as const;
