/// <reference types="vitest/config" />
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Caminhos relativos: o site funciona na raiz do domínio ou em uma subpasta.
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  // Testes automáticos das regras de negócio (npm test). Rodam no Node, sem navegador.
  test: {
    include: ["src/**/*.test.ts", "supabase/**/*.test.ts"],
    environment: "node",
  },
});
