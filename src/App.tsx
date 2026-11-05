import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { useRoute, type Route } from "@/app/router";
import { useRouteFocus } from "@/app/useRouteFocus";
import { AccessShortcuts } from "@/components/a11y/AccessShortcuts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AccessibilityPage } from "@/pages/AccessibilityPage";
import { AdminPage } from "@/pages/AdminPage";
import { BookingPage } from "@/pages/BookingPage";
import { HomePage } from "@/pages/HomePage";
import { MyAppointmentsPage } from "@/pages/MyAppointmentsPage";

/** Qual página mostrar em cada tela (as rotas ficam em app/routes.ts). */
function CurrentPage({ route }: { route: Route }) {
  switch (route.name) {
    case "inicio":
      return <HomePage />;
    case "agendar":
      return <BookingPage params={route.params} />;
    case "meusAgendamentos":
      return <MyAppointmentsPage params={route.params} />;
    case "painel":
      return <AdminPage />;
    case "acessibilidade":
      return <AccessibilityPage />;
  }
}

/**
 * Estrutura comum a todas as telas: atalhos de acesso, header, o conteúdo
 * principal da tela atual, rodapé e o atalho do WhatsApp.
 *
 * As animações usam a biblioteca Motion; com movimento reduzido,
 * MotionConfig remove os deslocamentos e mantém só as mudanças de opacidade.
 */
export function App() {
  const reduceMotion = useReducedMotion();
  const route = useRoute();
  useRouteFocus(route);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
        <AccessShortcuts />
        <Header route={route} />
        <main id="conteudo" tabIndex={-1} className="isolate overflow-x-clip">
          <CurrentPage key={route.key} route={route} />
        </main>
        <Footer />
        <WhatsAppButton key={route.name} />
      </MotionConfig>
    </LazyMotion>
  );
}
