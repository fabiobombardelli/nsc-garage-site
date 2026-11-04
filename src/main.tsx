import "@fontsource/hanken-grotesk/latin-400.css";
import "@fontsource/hanken-grotesk/latin-500.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles/global.css";

// Animações de entrada só se aplicam com JavaScript ativo (ver motion.css).
document.documentElement.classList.add("js");

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Elemento #root não encontrado em index.html");

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
