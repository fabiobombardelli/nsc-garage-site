import { site } from "@/content/site";
import { useHeroWindow } from "@/hooks/useHeroWindow";
import { heroVideo } from "@/lib/assets";

/**
 * Abertura: o vídeo da equipe aparece por uma janela no papel e, conforme
 * a página rola, a janela abre até a tela inteira (ver hero.css).
 */
export function Hero() {
  const { sectionRef, stageRef } = useHeroWindow();

  return (
    <section id="inicio" ref={sectionRef} className="hero">
      <div ref={stageRef} className="hero-stage">
        <div className="hero-media">
          <video
            poster={heroVideo.poster}
            autoPlay
            muted
            loop
            playsInline
            aria-label="O 350Z número 69 da equipe NSC derrapando na pista"
          >
            {heroVideo.sources.map((source) => (
              <source key={source.src} {...source} />
            ))}
          </video>
        </div>

        <div className="hero-copy container-site">
          <h1 className="hero-title type-head">
            Competir é <br />a obsessão.
          </h1>
          <div className="hero-aside">
            <p>
              Carros são nossa paixão. Preparamos carros de drift e competição e cuidamos do seu
              esportivo com o mesmo rigor de pista.
            </p>
            <a href="#contato" className="button">
              {site.primaryAction}
            </a>
          </div>
        </div>

        <p className="hero-caption" aria-hidden="true">
          350Z #69 da equipe NSC
        </p>
      </div>
    </section>
  );
}
