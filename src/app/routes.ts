import { site } from "@/content/site";

/**
 * Telas do site. Cada tela tem um endereço depois do "#/" e um título de
 * página próprio (WCAG 2.4.2). A página inicial não tem caminho: qualquer
 * endereço sem "#/" (como "#servicos") é uma âncora dentro dela.
 */
export const routes = {
  inicio: { path: "", title: `${site.name} | Preparação Premium de Drift` },
  agendar: { path: "agendar", title: `Agendar avaliação | ${site.name}` },
  meusAgendamentos: { path: "meus-agendamentos", title: `Meus agendamentos | ${site.name}` },
  painel: { path: "painel", title: `Painel da oficina | ${site.name}` },
  acessibilidade: { path: "acessibilidade", title: `Acessibilidade | ${site.name}` },
} as const;

export type RouteName = keyof typeof routes;
