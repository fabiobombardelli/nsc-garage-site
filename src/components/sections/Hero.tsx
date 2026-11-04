import { ArrowRight } from "lucide-react";
import { heroVideo } from "@/lib/assets";

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative z-30 isolate h-svh min-h-[640px] overflow-hidden bg-background"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        poster={heroVideo.poster}
        autoPlay
        muted
        loop
        playsInline
        aria-label="Carro preparado realizando drift em pista noturna"
      >
        {heroVideo.sources.map((source) => (
          <source key={source.src} {...source} />
        ))}
      </video>
      <div className="hero-shade absolute inset-0" />

      <div className="container-site relative flex h-full items-end pb-20 sm:pb-28">
        <div className="hero-copy relative max-w-[760px]">
          <h1 className="font-display text-4xl leading-[1.2] uppercase sm:text-5xl lg:text-6xl">
            <span className="mb-1 block sm:mb-2">
              Carros são nossa <span className="text-primary">paixão.</span>
            </span>
            <span className="block">
              Competir é a <span className="text-primary">obsessão.</span>
            </span>
          </h1>

          <p className="mt-5 max-w-[52ch] text-base leading-relaxed text-foreground/80 sm:text-lg">
            Manutenção premium e preparação de carros de competição e drift, com a mesma exigência
            dentro e fora da pista.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#contato" className="btn btn-primary">
              Agende uma avaliação <ArrowRight size={16} aria-hidden="true" />
            </a>
            <a href="#servicos" className="btn btn-outline">
              Nossos serviços
            </a>
          </div>
        </div>
      </div>

      <a href="#trajetoria" className="scroll-cue" aria-label="Ir para a trajetória">
        <span />
        Role para acelerar
      </a>
    </section>
  );
}
