export type ServiceGroup = "Pista" | "Rua";

export type Service = {
  group: ServiceGroup;
  title: string;
  description: string;
};

/**
 * Serviços da seção "Serviços", agrupados por onde o carro vai rodar.
 * O formulário de contato lista os mesmos serviços automaticamente.
 */
export const services: Service[] = [
  {
    group: "Pista",
    title: "Preparação para drift",
    description: "Chassi, ângulo de esterço e tudo o que o carro precisa para andar de lado.",
  },
  {
    group: "Pista",
    title: "Preparação de motor",
    description: "Montagem interna, acerto em bancada e mapeamento com potência utilizável.",
  },
  {
    group: "Pista",
    title: "Suspensão e geometria",
    description: "Geometria desenvolvida no box para tração, ângulo e previsibilidade no limite.",
  },
  {
    group: "Pista",
    title: "Telemetria e acerto",
    description: "Dados de bordo para transformar a sensação do piloto em ajuste preciso.",
  },
  {
    group: "Pista",
    title: "Peças usinadas",
    description: "Componentes de suspensão e diferencial feitos em casa, sob medida.",
  },
  {
    group: "Rua",
    title: "Manutenção premium",
    description: "Revisões, diagnóstico e reparos de esportivos e importados, com rigor de pista.",
  },
];
