import { LazyMotion, MotionConfig, domAnimation } from "motion/react";
import { Suspense, useEffect } from "react";
import { lazyPage } from "@/app/lazyPage";
import { useRoute, type Route } from "@/app/router";
import { useRouteFocus } from "@/app/useRouteFocus";
import { AccessShortcuts } from "@/components/a11y/AccessShortcuts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { HomePage } from "@/pages/HomePage";

// Telas internas: baixadas sob demanda (e de antemão, logo depois da página inicial).
const BookingPage = lazyPage(() => import("@/pages/BookingPage").then((m) => m.BookingPage));
const MyAppointmentsPage = lazyPage(() =>
  import("@/pages/MyAppointmentsPage").then((m) => m.MyAppointmentsPage),
);
const AdminPage = lazyPage(() => import("@/pages/AdminPage").then((m) => m.AdminPage));
const AccessibilityPage = lazyPage(() =>
  import("@/pages/AccessibilityPage").then((m) => m.AccessibilityPage),
);
const PrivacyPage = lazyPage(() => import("@/pages/PrivacyPage").then((m) => m.PrivacyPage));
const internalPages = [BookingPage, MyAppointmentsPage, AdminPage, AccessibilityPage, PrivacyPage];

/** Pouco depois que a página terminou de carregar, baixa o código das outras telas. */
function usePreloadPages() {
  useEffect(() => {
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(() => {
        for (const page of internalPages) page.preload().catch(() => {});
      }, 1500);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(timer);
    };
  }, []);
}

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
  usePreloadPages();

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reduceMotion ? "always" : "never"}>
        <AccessShortcuts route={route} />
        <Header route={route} />
        <main id="conteudo" tabIndex={-1} className="isolate overflow-x-clip">
          {/* Só aparece se a tela interna ainda não chegou (rede lenta). */}
          <Suspense
            fallback={
              <p role="status" className="container-site min-h-[70vh] pt-40">
                Carregando a tela…
              </p>
            }
          >
            <CurrentPage key={route.key} route={route} />
          </Suspense>
        </main>
        <Footer route={route} />
        {/* Nas telas internas o botão flutuante cobriria as ações do formulário; o
            WhatsApp continua no rodapé, no mesmo lugar em todas as telas (WCAG 3.2.6). */}
        {route.name === "inicio" && <WhatsAppButton />}
      </MotionConfig>
    </LazyMotion>
  );
}
