import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Timeline } from "@/components/sections/Timeline";

/** A página inicial, na ordem em que o visitante a percorre. */
export function HomePage() {
  return (
    <>
      <Hero />
      <Timeline />
      <About />
      <Services />
      <Contact />
    </>
  );
}
