import "@fontsource-variable/archivo/wdth.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initAccessibility } from "./lib/accessibility";
import { loadVLibrasAfterPageLoad } from "./lib/vlibras";
import "./styles/global.css";

// Preferências de acessibilidade (movimento, contraste, fonte) antes do primeiro desenho.
initAccessibility();
// Estados iniciais das animações só existem com JavaScript ativo.
document.documentElement.classList.add("js");

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Elemento #root não encontrado em index.html");

// Tradução para Libras (VLibras), carregada depois da página.
loadVLibrasAfterPageLoad();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
