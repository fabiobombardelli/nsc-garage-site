import partsImage from "@/assets/images/parts-drift.jpg";
import trackImage from "@/assets/images/track-drift.jpg";
import workshopImage from "@/assets/images/workshop-drift.jpg";

export type Milestone = {
  year: number;
  title: string;
  text: string;
  image: string;
};

/**
 * Marcos exibidos na seção "Nossa trajetória", em ordem cronológica.
 * Para adicionar um marco, basta incluir um novo item na lista;
 * a pista e a animação do carro se ajustam sozinhas.
 */
export const milestones: Milestone[] = [
  {
    year: 2015,
    title: "O box abre as portas",
    text: "Primeira bancada de usinagem e o elevador de duas colunas.",
    image: workshopImage,
  },
  {
    year: 2016,
    title: "Primeiro carro de competição",
    text: "Chassi reforçado e o setup de ângulo que virou assinatura.",
    image: trackImage,
  },
  {
    year: 2017,
    title: "Bancada de motores",
    text: "Montagem interna e acerto fino para entregar potência utilizável.",
    image: partsImage,
  },
  {
    year: 2018,
    title: "Entrada na série nacional",
    text: "Top 20 na primeira temporada com telemetria própria de bordo.",
    image: trackImage,
  },
  {
    year: 2019,
    title: "Suspensão in-house",
    text: "Geometria desenvolvida no box, da prancheta ao primeiro shakedown.",
    image: partsImage,
  },
  {
    year: 2020,
    title: "Oficina de bancada avançada",
    text: "Célula de força e rolos de tração para validar cada parafuso.",
    image: workshopImage,
  },
  {
    year: 2021,
    title: "Expansão da equipe",
    text: "Mais três especialistas e uma nova área exclusiva para competição.",
    image: workshopImage,
  },
  {
    year: 2022,
    title: "Título da categoria B",
    text: "Consistência de ângulo que virou referência no traçado noturno.",
    image: trackImage,
  },
  {
    year: 2023,
    title: "Telemetria própria",
    text: "Dados em tempo real para transformar sensação em ajuste preciso.",
    image: partsImage,
  },
  {
    year: 2024,
    title: "Fábrica de peças usinadas",
    text: "Suspensão e diferenciais produzidos em casa, peça a peça.",
    image: partsImage,
  },
];
