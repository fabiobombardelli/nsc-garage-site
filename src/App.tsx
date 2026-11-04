import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/sections/Hero";
import { Timeline } from "@/components/sections/Timeline";
import { Workshop } from "@/components/sections/Workshop";

export function App() {
  return (
    <>
      <Header />
      <main className="isolate overflow-x-clip">
        <Hero />
        <Timeline />
        <Workshop />
      </main>
      <Footer />
    </>
  );
}
