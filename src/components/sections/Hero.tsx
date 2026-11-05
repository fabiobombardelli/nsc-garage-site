import { Pause, Play } from "lucide-react";
import { easeIn, m, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { MaskedLine } from "@/components/ui/Reveal";
import { site } from "@/content/site";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { heroVideo } from "@/lib/assets";
import { cn } from "@/lib/cn";

/**
 * Topo: o vídeo da equipe em tela cheia e o slogan completo da marca como
 * monumento, uma frase em cada canto.
 *
 * Ao rolar, o topo fica preso na tela por mais uma tela de rolagem: as duas
 * frases saem pelas laterais, como portas se abrindo, o escurecimento do
 * vídeo diminui e só então a página segue.
 *
 * Desempenho: a imagem de capa (pôster) aparece de imediato; o vídeo só
 * começa a baixar depois que a página terminou de carregar, para não
 * disputar a rede com o texto, a fonte e o código (RNF-03).
 *
 * Acessibilidade: o vídeo tem botão de pausa (WCAG 2.2.2), para fora da
 * tela e não toca sozinho com movimento reduzido. Com movimento reduzido,
 * ou se o slogan não couber na altura da tela (fonte muito ampliada), o
 * topo não fica preso e as frases não se movem.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const fits = useFitsViewport(titleRef);
  const pinned = !reduceMotion && fits;
  const [playing, setPlaying] = useState(!reduceMotion);
  const onScreen = useInView(sectionRef, { threshold: 0.05 });
  const videoReady = useAfterPageLoad();
  const [lineOne, lineTwo] = site.tagline;

  useEffect(() => {
    if (reduceMotion) setPlaying(false);
  }, [reduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoReady) return;
    if (playing && onScreen) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [playing, onScreen, videoReady]);

  // Progresso enquanto o topo está preso: 0 no início, 1 quando a página segue.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  // As frases aceleram ao sair e se inclinam no sentido do movimento; o
  // último terço da rolagem mostra só o vídeo.
  const exit = { ease: easeIn };
  const lineOneX = useTransform(scrollYProgress, [0, 0.55], ["0%", "-115%"], exit);
  const lineTwoX = useTransform(scrollYProgress, [0.08, 0.63], ["0%", "115%"], exit);
  const lineOneSkew = useTransform(scrollYProgress, [0, 0.55], [0, 10], exit);
  const lineTwoSkew = useTransform(scrollYProgress, [0.08, 0.63], [0, -10], exit);
  const lineOneOpacity = useTransform(scrollYProgress, [0.3, 0.55], [1, 0]);
  const lineTwoOpacity = useTransform(scrollYProgress, [0.38, 0.63], [1, 0]);
  const scrimOpacity = useTransform(scrollYProgress, [0.1, 0.7], [1, 0.3]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1.08, 1]);

  return (
    <section
      id="inicio"
      ref={sectionRef}
      className={cn("hero", pinned && "is-pinned")}
      aria-labelledby="hero-title"
    >
      <div className="hero-stage">
        <m.div className="hero-media" style={pinned ? { scale: videoScale } : undefined}>
          <m.video
            ref={videoRef}
            poster={heroVideo.poster}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Vídeo: o 350Z número 69 da equipe NSC derrapando na pista"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {videoReady &&
              heroVideo.sources.map((source) => <source key={source.src} {...source} />)}
          </m.video>
        </m.div>
        <m.div
          className="hero-scrim"
          aria-hidden="true"
          style={pinned ? { opacity: scrimOpacity } : undefined}
        />

        <div className="hero-layout container-site">
          <h1 id="hero-title" ref={titleRef} className="hero-title type-monument">
            <m.span
              className="hero-line hero-line-one"
              style={
                pinned ? { x: lineOneX, skewX: lineOneSkew, opacity: lineOneOpacity } : undefined
              }
            >
              <MaskedLine onLoad delay={0.15}>
                {lineOne}
              </MaskedLine>
            </m.span>{" "}
            <m.span
              className="hero-line hero-line-two"
              style={
                pinned ? { x: lineTwoX, skewX: lineTwoSkew, opacity: lineTwoOpacity } : undefined
              }
            >
              <MaskedLine onLoad delay={0.32}>
                {lineTwo}
              </MaskedLine>
            </m.span>
          </h1>
        </div>

        <div className="hero-controls container-site">
          <button
            type="button"
            className="icon-button"
            onClick={() => setPlaying((current) => !current)}
            aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
          >
            {playing ? (
              <Pause size={18} aria-hidden="true" />
            ) : (
              <Play size={18} aria-hidden="true" />
            )}
          </button>
          <p className="hero-caption">350Z #69 da equipe NSC</p>
        </div>
      </div>
    </section>
  );
}

/** Fica verdadeiro depois do evento load da página (e de um respiro do navegador). */
function useAfterPageLoad() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let timer = 0;
    const done = () => {
      timer = window.setTimeout(() => setReady(true), 300);
    };
    if (document.readyState === "complete") done();
    else window.addEventListener("load", done, { once: true });
    return () => {
      window.removeEventListener("load", done);
      window.clearTimeout(timer);
    };
  }, []);
  return ready;
}

/**
 * O topo só fica preso se as duas frases e as margens couberem na altura da
 * tela. Com a fonte muito ampliada numa tela baixa, não cabem, e o topo
 * volta a rolar normalmente.
 */
function useFitsViewport(titleRef: RefObject<HTMLElement | null>) {
  const [fits, setFits] = useState(true);

  useEffect(() => {
    const title = titleRef.current;
    const layout = title?.parentElement;
    if (!title || !layout) return;

    const measure = () => {
      const { paddingTop, paddingBottom } = getComputedStyle(layout);
      const lines = Array.from(title.children, (line) => (line as HTMLElement).offsetHeight);
      const needed =
        lines.reduce((total, height) => total + height, 0) +
        parseFloat(paddingTop) +
        parseFloat(paddingBottom) +
        48;
      setFits(needed <= window.innerHeight);
    };

    measure();
    const observer = new ResizeObserver(measure);
    for (const line of title.children) observer.observe(line);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [titleRef]);

  return fits;
}
