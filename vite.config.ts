/// <reference types="vitest/config" />
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

/**
 * Pede a fonte do texto (Archivo, alfabeto latino) junto com o HTML, sem
 * esperar o CSS chegar: o slogan do topo aparece mais cedo (RNF-03).
 */
function preloadFont(): Plugin {
  return {
    name: "nsc-preload-font",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(_html, { bundle }) {
        const font = Object.keys(bundle ?? {}).find((file) =>
          /archivo-latin-wdth-normal-[\w-]+\.woff2$/.test(file),
        );
        if (!font) return [];
        return [
          {
            tag: "link",
            attrs: {
              rel: "preload",
              href: `./${font}`,
              as: "font",
              type: "font/woff2",
              crossorigin: "",
            },
            injectTo: "head",
          },
        ];
      },
    },
  };
}

export default defineConfig({
  // Caminhos relativos: o site funciona na raiz do domínio ou em uma subpasta.
  base: "./",
  plugins: [react(), tailwindcss(), preloadFont()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  // Testes automáticos das regras de negócio (npm test). Rodam no Node, sem navegador.
  test: {
    include: ["src/**/*.test.ts", "supabase/**/*.test.ts"],
    environment: "node",
  },
});
