import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { AccessShortcuts } from "@/components/a11y/AccessShortcuts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Timeline } from "@/components/sections/Timeline";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A página, na ordem em que o visitante a percorre. As animações usam a
 * biblioteca Motion; com movimento reduzido, MotionConfig remove os
 * deslocamentos e mantém só as mudanças de opacidade.
 */
export function App() {
  const reduceMotion = useReducedMotion();

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
        <AccessShortcuts />
        <Header />
        <main id="conteudo" tabIndex={-1} className="isolate overflow-x-clip">
          <Hero />
          <Timeline />
          <About />
          <Services />
          <Contact />
        </main>
        <Footer />
        <WhatsAppButton />
      </MotionConfig>
    </LazyMotion>
  );
}
