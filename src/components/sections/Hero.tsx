import posterImage from "@/assets/images/track-drift.jpg";
import { heroVideoUrl } from "@/lib/assets";

export function Hero() {
  return (
    <section id="inicio" className="relative z-30 isolate h-svh min-h-[640px] overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={heroVideoUrl}
        poster={posterImage}
        autoPlay
        muted
        loop
        playsInline
        aria-label="Carro preparado realizando drift em pista noturna"
      />
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
        </div>
      </div>

      <a href="#trajetoria" className="scroll-cue" aria-label="Ir para a trajetória">
        <span />
        Role para acelerar
      </a>
    </section>
  );
}
