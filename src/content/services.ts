export type ServiceGroup = "Pista" | "Rua";

export type Service = {
  /** Identificador usado nos links e nos atributos de acessibilidade. */
  id: string;
  group: ServiceGroup;
  title: string;
  description: string;
  /** O que costuma estar incluído. TODO: itens de exemplo, confirmar com a oficina. */
  includes: string[];
};

/**
 * Serviços: cada um é uma gaveta do carrinho de ferramentas na seção
 * "Serviços". O formulário de contato lista os mesmos serviços.
 */
export const services: Service[] = [
  {
    id: "drift",
    group: "Pista",
    title: "Preparação para drift",
    description: "Chassi, ângulo de esterço e tudo o que o carro precisa para andar de lado.",
    includes: [
      "Kit de ângulo de esterço",
      "Freio de mão hidráulico",
      "Reforço de chassi",
      "Acerto para a pista",
    ],
  },
  {
    id: "motor",
    group: "Pista",
    title: "Preparação de motor",
    description: "Montagem interna, acerto em bancada e mapeamento com potência utilizável.",
    includes: [
      "Montagem interna",
      "Arrefecimento para pista",
      "Mapeamento",
      "Validação em dinamômetro",
    ],
  },
  {
    id: "suspensao",
    group: "Pista",
    title: "Suspensão e geometria",
    description: "Geometria desenvolvida no box para tração, ângulo e previsibilidade no limite.",
    includes: [
      "Alinhamento de pista",
      "Ajuste de coilovers",
      "Pesagem e acerto de cantos",
      "Buchas e terminais",
    ],
  },
  {
    id: "telemetria",
    group: "Pista",
    title: "Telemetria e acerto",
    description: "Dados de bordo para transformar a sensação do piloto em ajuste preciso.",
    includes: ["Instalação de sensores", "Leitura dos dados com o piloto", "Ajuste entre baterias"],
  },
  {
    id: "usinagem",
    group: "Pista",
    title: "Peças usinadas",
    description: "Componentes de suspensão e diferencial feitos em casa, sob medida.",
    includes: ["Projeto da peça", "Usinagem em casa", "Montagem e teste no carro"],
  },
  {
    id: "manutencao",
    group: "Rua",
    title: "Manutenção premium",
    description: "Revisões, diagnóstico e reparos de esportivos e importados, com rigor de pista.",
    includes: [
      "Revisão completa",
      "Diagnóstico eletrônico",
      "Freios e fluidos",
      "Preparação para track day",
    ],
  },
];
