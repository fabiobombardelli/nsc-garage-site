import { ArrowRight, Pause, Play } from "lucide-react";
import { m, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MaskedLine } from "@/components/ui/Reveal";
import { site } from "@/content/site";
import { useInView } from "@/hooks/useInView";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { heroVideo } from "@/lib/assets";

/**
 * Topo: o vídeo da equipe em tela cheia e o slogan completo da marca como
 * monumento, uma frase em cada canto. Ao rolar, as duas linhas se afastam
 * e encolhem um pouco, e o vídeo se aproxima.
 *
 * Acessibilidade: o vídeo tem botão de pausa (WCAG 2.2.2), para fora da
 * tela e não toca sozinho quando o movimento está reduzido.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState(!reduceMotion);
  const onScreen = useInView(sectionRef, { threshold: 0.05 });
  const [lineOne, lineTwo] = site.tagline;

  useEffect(() => {
    if (reduceMotion) setPlaying(false);
  }, [reduceMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing && onScreen) video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [playing, onScreen]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const lineOneX = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const lineTwoX = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  return (
    <section id="inicio" ref={sectionRef} className="hero" aria-labelledby="hero-title">
      <m.div className="hero-media" style={reduceMotion ? undefined : { scale: videoScale }}>
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
          {heroVideo.sources.map((source) => (
            <source key={source.src} {...source} />
          ))}
        </m.video>
      </m.div>
      <div className="hero-scrim" aria-hidden="true" />

      <div className="hero-layout container-site">
        <h1 id="hero-title" className="hero-title type-monument">
          <m.span
            className="hero-line hero-line-one"
            style={reduceMotion ? undefined : { x: lineOneX, scale: titleScale }}
          >
            <MaskedLine onLoad delay={0.15}>
              {lineOne}
            </MaskedLine>
          </m.span>{" "}
          <m.span
            className="hero-line hero-line-two"
            style={reduceMotion ? undefined : { x: lineTwoX, scale: titleScale }}
          >
            <MaskedLine onLoad delay={0.32}>
              {lineTwo}
            </MaskedLine>
          </m.span>
        </h1>

        <m.div
          className="hero-aside"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        >
          <p>
            Preparamos carros de drift e competição e cuidamos do seu esportivo com o mesmo rigor de
            pista.
          </p>
          <a href="#contato" className="button">
            {site.primaryAction}
            <ArrowRight className="button-arrow" size={18} aria-hidden="true" />
          </a>
        </m.div>
      </div>

      <div className="hero-controls container-site">
        <button
          type="button"
          className="icon-button"
          onClick={() => setPlaying((current) => !current)}
          aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
        >
          {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
        <p className="hero-caption">350Z #69 da equipe NSC</p>
      </div>
    </section>
  );
}
