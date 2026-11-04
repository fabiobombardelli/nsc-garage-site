import { Activity, Cog, Factory, Flag, Gauge, Wrench, type LucideIcon } from "lucide-react";

export type Service = {
  title: string;
  description: string;
  icon: LucideIcon;
};

/**
 * Serviços exibidos na seção "Serviços" e no seletor do formulário de contato.
 * Ícones disponíveis: https://lucide.dev/icons
 */
export const services: Service[] = [
  {
    title: "Manutenção premium",
    description:
      "Revisões, diagnósticos e reparos para esportivos e importados, com o mesmo padrão aplicado aos carros de pista.",
    icon: Wrench,
  },
  {
    title: "Preparação de motor",
    description:
      "Montagem interna, acerto em bancada e mapeamento para entregar potência utilizável e confiável.",
    icon: Gauge,
  },
  {
    title: "Suspensão e geometria",
    description: "Geometria desenvolvida no box para tração, ângulo e previsibilidade no limite.",
    icon: Cog,
  },
  {
    title: "Preparação para drift",
    description:
      "Do projeto ao shakedown: chassi, ângulo de esterço e tudo o que o carro precisa para andar de lado.",
    icon: Flag,
  },
  {
    title: "Telemetria e acerto de pista",
    description: "Dados em tempo real para transformar a sensação do piloto em ajuste preciso.",
    icon: Activity,
  },
  {
    title: "Peças usinadas sob medida",
    description: "Componentes de suspensão e diferencial produzidos em casa, peça a peça.",
    icon: Factory,
  },
];
