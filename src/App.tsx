import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Timeline } from "@/components/sections/Timeline";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useReveal } from "@/hooks/useReveal";

export function App() {
  useReveal();

  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" className="isolate overflow-x-clip">
        <Hero />
        <Timeline />
        <About />
        <Services />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
