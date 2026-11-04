import dayOnTrack from "@/assets/images/footage/day-smoke.webp";
import duskSide from "@/assets/images/footage/dusk-side.webp";
import nightSide from "@/assets/images/footage/night-side.webp";
import nightStart from "@/assets/images/footage/night-start.webp";
import partsImage from "@/assets/images/parts-drift.jpg";
import workshopImage from "@/assets/images/workshop-drift.jpg";

export type Milestone = {
  year: number;
  title: string;
  text: string;
  image: string;
  imageAlt: string;
};

/**
 * Marcos da seção "Trajetória", em ordem cronológica.
 *
 * Cada marco vira uma curva da pista e um clipping point que acende
 * quando o carro passa. Adicione, remova ou reordene à vontade: o
 * traçado é recalculado sozinho.
 *
 * TODO: os textos são provisórios. As fotos de box e peças são
 * ilustrativas; as de pista são quadros do vídeo da equipe.
 */
export const milestones: Milestone[] = [
  {
    year: 2015,
    title: "O box abre as portas",
    text: "Primeira bancada de usinagem e o elevador de duas colunas.",
    image: workshopImage,
    imageAlt: "Carro sobre o elevador da oficina",
  },
  {
    year: 2016,
    title: "Primeiro carro de competição",
    text: "Chassi reforçado e o acerto de ângulo que virou assinatura.",
    image: dayOnTrack,
    imageAlt: "350Z da NSC derrapando de lado em meio à fumaça",
  },
  {
    year: 2017,
    title: "Bancada de motores",
    text: "Montagem interna e acerto fino para entregar potência utilizável.",
    image: partsImage,
    imageAlt: "Peças usinadas sobre a bancada",
  },
  {
    year: 2018,
    title: "Entrada na série nacional",
    text: "Top 20 na primeira temporada, com telemetria própria a bordo.",
    image: nightStart,
    imageAlt: "Carro da NSC à noite, depois da linha quadriculada de largada",
  },
  {
    year: 2019,
    title: "Suspensão feita em casa",
    text: "Geometria desenvolvida no box, da prancheta ao primeiro shakedown.",
    image: partsImage,
    imageAlt: "Componentes de suspensão sobre a bancada",
  },
  {
    year: 2020,
    title: "Bancada de testes",
    text: "Célula de carga e rolos de tração para validar cada parafuso.",
    image: workshopImage,
    imageAlt: "Oficina da NSC com carro no elevador",
  },
  {
    year: 2021,
    title: "Equipe maior",
    text: "Mais três especialistas e uma área só para carros de competição.",
    image: duskSide,
    imageAlt: "350Z da NSC derrapando no fim de tarde",
  },
  {
    year: 2022,
    title: "Título da categoria B",
    text: "Ângulo constante que virou referência no traçado noturno.",
    image: nightSide,
    imageAlt: "350Z da NSC de lado na pista à noite",
  },
  {
    year: 2023,
    title: "Telemetria própria",
    text: "Dados em tempo real para transformar sensação em ajuste preciso.",
    image: dayOnTrack,
    imageAlt: "350Z da NSC na curva, cercado de fumaça",
  },
  {
    year: 2024,
    title: "Fábrica de peças usinadas",
    text: "Suspensão e diferenciais produzidos em casa, peça a peça.",
    image: partsImage,
    imageAlt: "Peças usinadas pela NSC",
  },
];
