/**
 * Arquivos de marca opcionais.
 *
 * Coloque o logo em `src/assets/brand/logo.png` (ou .svg/.webp) e ele
 * passa a ser usado automaticamente. Enquanto o arquivo não existir,
 * o site mostra o nome da marca em texto.
 */
const logoFiles = import.meta.glob<string>("../assets/brand/logo.{png,svg,webp}", {
  eager: true,
  import: "default",
});

export const logoUrl: string | undefined = Object.values(logoFiles)[0];

/** Vídeo de fundo do topo da página (arquivo em `public/media/`). */
export const heroVideoUrl = "/media/hero-drift.webm";
