import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

/**
 * Apresentação da NSC Garage: pacote separado do site, que reaproveita do
 * site (pasta ../src) a fonte, o carro, as fotos da Trajetória e a geometria
 * da pista. O alias "@" é o mesmo do site, para os arquivos importados de lá
 * continuarem resolvendo os próprios imports.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "../src");

export default defineConfig({
  base: "./",
  resolve: {
    alias: {
      "@site": site,
      "@media": path.resolve(here, "../public/media"),
      "@": site,
    },
  },
  server: { port: 5180, host: true, fs: { allow: [".."] } },
  preview: { port: 4180, host: true },
  build: {
    target: "es2022",
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1600,
  },
});
