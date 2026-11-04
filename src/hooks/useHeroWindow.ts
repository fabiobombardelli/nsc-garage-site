import { useEffect, useRef } from "react";

/** Fração do trecho fixo em que a janela termina de abrir; o resto segura o vídeo em tela cheia. */
const OPEN_BY = 0.75;
/** A partir daqui o título e a ação do topo deixam de existir na tela (já estão invisíveis). */
const HIDE_COPY_AT = 0.4;

/**
 * Abre a janela do vídeo do topo conforme a página rola.
 * Publica o progresso (0 → 1) na variável CSS --open do palco; o
 * desenho da abertura fica em hero.css.
 */
export function useHeroWindow() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      const hold = section.offsetHeight - window.innerHeight;
      if (hold <= 0) {
        stage.style.setProperty("--open", "1");
        return;
      }
      const scrolled = -section.getBoundingClientRect().top;
      const progress = Math.min(1, Math.max(0, scrolled / (hold * OPEN_BY)));
      stage.style.setProperty("--open", progress.toFixed(4));
      // O texto já sumiu (opacidade 0) antes da janela chegar até ele; aqui sai de cena de vez.
      stage.classList.toggle("is-open", progress > HIDE_COPY_AT);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return { sectionRef, stageRef };
}
