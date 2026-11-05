import cockpit2012 from "@/assets/images/history/2012-cockpit.webp";
import paddock2012 from "@/assets/images/history/2012-paddock.webp";
import silvia2013 from "@/assets/images/history/2013-silvia-paulista.webp";
import z350Red2015 from "@/assets/images/history/2015-350z-vermelho.webp";
import r34KingOfNations2016 from "@/assets/images/history/2016-r34-king-of-nations.webp";
import profileSdb2018 from "@/assets/images/history/2018-perfil-sdb.webp";
import z350Nsc2019 from "@/assets/images/history/2019-350z-nsc-69.webp";
import hyperdrive2019 from "@/assets/images/history/2019-hyperdrive.webp";
import mustangPortrait2020 from "@/assets/images/history/2020-mustang-69-retrato.webp";
import longBeach2023 from "@/assets/images/history/2023-formula-drift-long-beach.webp";
import longBeach2024 from "@/assets/images/history/2024-formula-drift-long-beach.webp";
import ebisu2026 from "@/assets/images/history/2026-ebisu-japao.webp";
import matsuri2026 from "@/assets/images/history/2026-matsuri-japao.webp";

export type MilestonePhoto = {
  src: string;
  /** Descreve o que a foto mostra de fato (nem sempre é o evento do marco). */
  alt: string;
  /** Fonte da imagem, exibida junto da foto. */
  credit: string;
};

export type Milestone = {
  /** Identificador único (vários marcos podem ter o mesmo ano). */
  id: string;
  /** Ano em destaque no card. */
  year: number;
  /** Data (ou, sem data documentada, o campeonato), em letra pequena ao lado do ano. */
  date: string;
  title: string;
  /** Texto do card. A primeira frase aparece direto; o resto abre em "Ler mais". */
  text: string;
  /** Sem foto pública verificada do evento: o card aparece só com texto. */
  photo: MilestonePhoto | null;
};

/**
 * Marcos da seção "Trajetória", em ordem cronológica.
 *
 * Fonte: "NSC Garage — História e Linha do Tempo" (pesquisa da equipe em
 * fontes públicas, 04/11/2026), seção 11 "Cards prontos — Versão Oficina".
 * Cada marco vira uma curva da pista e um cone que acende quando o carro
 * passa; o traçado é recalculado sozinho ao adicionar ou remover marcos.
 *
 * Fotos: imagens públicas de terceiros (crédito em cada uma), recortadas e
 * ampliadas para o site. TODO: trocar pelas versões tratadas e pelo
 * arquivo da NSC, e confirmar a autorização de uso antes de publicar.
 */
export const milestones: Milestone[] = [
  {
    id: "2012-primeiro-carro",
    year: 2012,
    date: "11 e 12 de fevereiro",
    title: "O primeiro carro de campeonato",
    text: "A NSC coloca seu primeiro carro de campeonato na pista: um Silvia S13 branco, preparado em Santos para o Paulista de Piracicaba. É ali que a oficina começa sua história competitiva.",
    photo: {
      src: cockpit2012,
      alt: "Diego Higa adolescente no banco do carro de competição, em Brasília, na temporada de 2012",
      credit: "Capa de vídeo no YouTube, via GTPlanet",
    },
  },
  {
    id: "2012-equipe",
    year: 2012,
    date: "agosto",
    title: "A oficina aprende a ser equipe",
    text: "Boxes dentro de estádios, viagens pelo país e operação de corrida de verdade. Na temporada de estreia, a NSC aprende na prática a trabalhar como equipe profissional de drift.",
    photo: {
      src: paddock2012,
      alt: "Paddock da DS Brasil Series montado dentro de um estádio, com carros e tendas das equipes",
      credit: "Capa de vídeo no YouTube, via SilviaOC",
    },
  },
  {
    id: "2013-vitrine",
    year: 2013,
    date: "outubro",
    title: "Da garagem para a vitrine",
    text: "A NSC ganha vitrine nacional: estande no X-treme Motorsports e presença constante no Campeonato Paulista. A oficina vira marca, com carro, estrutura e identidade próprias nas pistas.",
    photo: {
      src: silvia2013,
      alt: "Silvia amarelo derrapando no circuito montado dentro de um estádio, no Paulista de 2013",
      credit: "Capa de vídeo no YouTube",
    },
  },
  {
    id: "2015-palco",
    year: 2015,
    date: "Super Drift Brasil",
    title: "A oficina constrói o palco",
    text: "Neto cria o Super Drift Brasil com a NSC como patrocinadora e base da operação. A oficina deixa de só preparar carros: passa a construir o palco do drift brasileiro.",
    photo: {
      src: z350Red2015,
      alt: "Diego Higa ao lado do 350Z vermelho com as marcas NSC Garage e Rodera",
      credit: "Drifted",
    },
  },
  {
    id: "2015-mestres-japoneses",
    year: 2015,
    date: "12 e 13 de dezembro",
    title: "Recebendo os mestres japoneses",
    text: "A NSC organiza em Praia Grande uma etapa com Daigo Saito e Masashi Yokoi. Receber os maiores nomes do Japão valida, diante de todo o país, o nível técnico da casa.",
    // TODO: sem foto pública verificada deste evento; usar o arquivo da NSC.
    photo: null,
  },
  {
    id: "2016-podio-mundial",
    year: 2016,
    date: "King of Nations",
    title: "Trabalho de Santos, pódio mundial",
    text: "O Skyline R34 preparado pela NSC alcança o vice-campeonato mundial do King of Nations. A bancada de Santos passa a disputar pódios contra as melhores equipes do planeta.",
    photo: {
      src: r34KingOfNations2016,
      alt: "Skyline R34 preto e BMW E30 M3 lado a lado em batalha de drift, cercados de fumaça",
      credit: "Drifted",
    },
  },
  {
    id: "2018-dinastia",
    year: 2018,
    date: "Super Drift Brasil",
    title: "Método que vira dinastia",
    text: "Tetra do Super Drift Brasil e tri brasileiro não são acaso: são método. Preparação, manutenção e estratégia repetidos ano após ano transformam a NSC na equipe a ser batida.",
    photo: {
      src: profileSdb2018,
      alt: "Diego Higa de moletom do Super Drift Brasil, sentado diante do carro com o capô aberto",
      credit: "Super Drift Brasil, YouTube",
    },
  },
  {
    id: "2019-hyperdrive",
    year: 2019,
    date: "21 de agosto",
    title: "Uma oficina na tela do mundo",
    text: "O Mustang preparado com a NSC vence o Hyperdrive, da Netflix, e apresenta a oficina ao mundo inteiro. No rádio, Neto comanda como treinador: trabalho de família, em rede global.",
    photo: {
      src: hyperdrive2019,
      alt: "Diego Higa de capacete no cockpit do Mustang, à noite, durante o Hyperdrive",
      credit: "Netflix, YouTube",
    },
  },
  {
    id: "2019-carro-assinatura",
    year: 2019,
    date: "Brasileiro de Drift",
    title: "O carro-assinatura da casa",
    text: "O 350Z número 69, com NSC gigante na lateral, é a assinatura ambulante da oficina: tetracampeonato brasileiro e Capacete de Ouro coroam o projeto mais vitorioso da casa.",
    photo: {
      src: z350Nsc2019,
      alt: "350Z número 69 com NSC na lateral em batalha com o carro 77, de lado na curva",
      credit: "Eduardo Junior Photography, via CBA",
    },
  },
  {
    id: "2020-consistencia",
    year: 2020,
    date: "Super Drift Brasil",
    title: "Consistência de oficina campeã",
    text: "Seis títulos consecutivos de Super Drift Brasil. Mesmo na pandemia, a NSC mantém padrão, rotina e resultado: a maior dinastia do drift brasileiro foi construída carro a carro, em Santos.",
    photo: {
      src: mustangPortrait2020,
      alt: "Diego Higa de macacão, com o capacete na mão, ao lado do Mustang número 69 vermelho e preto",
      credit: "Drifted",
    },
  },
  {
    id: "2023-formula-drift",
    year: 2023,
    date: "abril",
    title: "Engenharia da casa nos EUA",
    text: "A NSC cruza o oceano: o GT86 com motor 2JZ e cerca de mil cavalos leva a preparação feita no Brasil à Formula Drift, a maior liga de drift do mundo.",
    photo: {
      src: longBeach2023,
      alt: "GT86 azul e vermelho com o nome Diego Higa derrapando no circuito de rua de Long Beach",
      credit: "MotorTrend",
    },
  },
  {
    id: "2024-laboratorio",
    year: 2024,
    date: "Formula Drift",
    title: "Cada etapa, um laboratório",
    text: "Na segunda temporada americana, a evolução do GT86 número 169 rende 224 pontos e a melhor marca da equipe na Formula Drift. Cada corrida vira aprendizado técnico para a oficina.",
    photo: {
      src: longBeach2024,
      alt: "GT86 preto em batalha de drift em Long Beach, encostado em outro carro, no meio da fumaça",
      credit: "GT Radial",
    },
  },
  {
    id: "2026-volta-a-fonte",
    year: 2026,
    date: "janeiro",
    title: "De volta à fonte",
    text: "Competir em Ebisu e no Matsuri é a NSC voltando à fonte: o Japão onde Neto aprendeu drift, agora recebido com estrutura, carro e história construídos pela própria oficina.",
    photo: {
      src: ebisu2026,
      alt: "Diego Higa com dois pilotos japoneses no paddock de Ebisu, diante dos carros",
      credit: "Canal Piloto Diego Higa, YouTube",
    },
  },
  {
    id: "2026-alem-do-drift",
    year: 2026,
    date: "outubro",
    title: "Além do drift",
    text: "A NSC amplia o repertório: a estreia no Endurance Brasil, com um Mustang GT4 liderando em Interlagos, mostra a casa também nas corridas de longa duração. Preparação não tem fronteira.",
    // TODO: sem foto pública verificada; usar o arquivo da NSC (fonte do fato: Revista Podium, 21/10/2026).
    photo: null,
  },
  {
    id: "2026-atracao",
    year: 2026,
    date: "28 e 29 de novembro",
    title: "A oficina que virou atração",
    text: "A NSC chega ao Recife Drift Show como atração principal, com seu piloto anunciado como octacampeão. De oficina de bairro em Santos a nome que lota evento no Brasil inteiro.",
    photo: {
      src: matsuri2026,
      alt: "Diego Higa de boné vermelho preparando o carro no Japão, em janeiro de 2026",
      credit: "Canal Piloto Diego Higa, YouTube",
    },
  },
];
