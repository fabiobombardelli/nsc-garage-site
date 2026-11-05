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
import { PrivacyPage } from "@/pages/PrivacyPage";

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
    case "privacidade":
      return <PrivacyPage />;
  }
}

/**
 * Estrutura comum a todas as telas: atalhos de acesso, header, o conteúdo
 * principal da tela atual e rodapé (mais o atalho do WhatsApp na inicial).
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
        <AccessShortcuts route={route} />
        <Header route={route} />
        <main id="conteudo" tabIndex={-1} className="isolate overflow-x-clip">
          <CurrentPage key={route.key} route={route} />
        </main>
        <Footer route={route} />
        {/* Nas telas internas o botão flutuante cobriria as ações do formulário; o
            WhatsApp continua no rodapé, no mesmo lugar em todas as telas (WCAG 3.2.6). */}
        {route.name === "inicio" && <WhatsAppButton />}
      </MotionConfig>
    </LazyMotion>
  );
}
