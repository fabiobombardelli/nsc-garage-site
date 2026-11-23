/**
 * Roteiro da apresentação: a fonte única da tela e do celular.
 *
 * Cada cena tem quem fala, o tempo previsto, os passos (cada "Próximo"
 * avança um passo na tela) e os pontos de fala, que aparecem só no celular.
 * Para trocar quem fala uma parte, mude `quem` aqui. Fatos só os documentados
 * em docs/historia-nsc.md, README.md e ACESSIBILIDADE.md.
 */

export type Integrante = "Fabio" | "Cawan" | "Erick" | "Mathias";

export const INTEGRANTES: readonly { id: Integrante; nome: string }[] = [
  { id: "Fabio", nome: "Fabio Bombardelli" },
  { id: "Cawan", nome: "Cawan Henrique" },
  { id: "Erick", nome: "Erick Brian" },
  { id: "Mathias", nome: "Mathias Rajão" },
];

export type BlocoNeto = {
  /** Frase de quem conduz para passar a palavra. */
  entrada: string;
  /** Deixas para o Neto, uma de cada vez, só se ele precisar. */
  perguntas: readonly string[];
  /** Segundos de cena em que o celular avisa "hora de agradecer". */
  avisoEm: number;
  /** Frase de quem conduz para retomar. */
  volta: string;
};

export type Cena = {
  id: string;
  numero: number;
  titulo: string;
  /** Quem fala. No bloco do Neto, quem conduz é `conduz`. */
  quem: Integrante | "Neto" | null;
  conduz?: Integrante;
  segundos: number;
  /** O que a tela faz a cada "Próximo" (um rótulo por passo). */
  passos: readonly string[];
  /** O que falar, em frases curtas. */
  pontos: readonly string[];
  /** Frase para passar a vez ao próximo. */
  passa?: string;
  neto?: BlocoNeto;
};

export const CENAS: readonly Cena[] = [
  {
    id: "s00-lobby",
    numero: 0,
    titulo: "Pareamento",
    quem: null,
    segundos: 0,
    passos: ["Aguardando o início"],
    pontos: [
      "Abra este link no celular de cada integrante e escolha o seu nome.",
      "Quando todos estiverem prontos, toque em Próximo para começar.",
    ],
  },
  {
    id: "s01-abertura",
    numero: 1,
    titulo: "Abertura",
    quem: "Fabio",
    segundos: 40,
    passos: ["Luzes do box e carro", "Slogan"],
    pontos: [
      "Boa noite. Somos Fabio, Cawan, Erick e Mathias.",
      "Nosso cliente é a NSC Garage, oficina de Santos que prepara carros de drift e de competição.",
      "Entregamos o site e um sistema de agendamento que qualquer pessoa consegue usar.",
    ],
    passa: "Cawan, conta quem é a NSC.",
  },
  {
    id: "s02-nsc",
    numero: 2,
    titulo: "Quem é a NSC",
    quem: "Cawan",
    segundos: 20,
    passos: ["Vídeo e Neto Street Car"],
    pontos: [
      "NSC quer dizer Neto Street Car.",
      "O Neto conheceu o drift morando no Japão e trouxe a modalidade para a Baixada Santista.",
    ],
    passa: "Ninguém conta essa história melhor do que quem viveu. Neto, com você.",
  },
  {
    id: "s03-neto",
    numero: 3,
    titulo: "A palavra do Neto",
    quem: "Neto",
    conduz: "Cawan",
    segundos: 120,
    passos: ["Trajetória em fotos (automática)"],
    pontos: [
      "A tela passa as fotos sozinha. Deixe o Neto falar.",
      "Use as perguntas só se ele precisar de uma deixa.",
    ],
    neto: {
      entrada: "Ninguém conta essa história melhor do que quem viveu. Neto, com você.",
      perguntas: [
        "Como o drift entrou na sua vida e virou a NSC?",
        "Que momentos mais marcaram a oficina?",
        "Por que ter um site próprio e o agendamento online importa para a NSC hoje?",
      ],
      avisoEm: 105,
      volta:
        "Obrigado, Neto. Foi para contar essa história e facilitar a vida de quem procura a oficina que fizemos este projeto.",
    },
  },
  {
    id: "s04-problema",
    numero: 4,
    titulo: "O problema",
    quem: "Cawan",
    segundos: 50,
    passos: ["Site antigo e problemas", "O que faltava"],
    pontos: [
      "A NSC tinha um site, mas era um modelo pronto e genérico.",
      "Sem cadeado (só http), WhatsApp com número falso e nada sobre drift.",
      "No teste de acessibilidade: imagens sem descrição e links sem nome.",
      "Marcar uma avaliação dependia de troca de mensagens.",
    ],
    passa: "Erick, como a gente imaginou o novo?",
  },
  {
    id: "s05-idealizacao",
    numero: 5,
    titulo: "Idealização",
    quem: "Erick",
    segundos: 90,
    passos: ["Ideias descartadas", "Paleta do box", "A letra", "Do wireframe ao site"],
    pontos: [
      "Antes de programar, definimos um mundo: o box à noite.",
      "Descartamos a página branca, o preto com neon e a ficha de julgamento.",
      "Grafite do piso, luz de LED no texto, vermelho só como a laca do carrinho de ferramentas.",
      "A letra é a pintura na parede do box.",
      "Do wireframe ao site: a ordem dos blocos é a ordem de leitura.",
    ],
    passa: "Fabio, e por dentro?",
  },
  {
    id: "s06-criacao",
    numero: 6,
    titulo: "Criação",
    quem: "Fabio",
    segundos: 100,
    passos: ["Três camadas", "O pedido desce", "Testes e publicação"],
    pontos: [
      "Pensem no site como um carro de competição.",
      "Carroceria: o que vocês veem, feito em React.",
      "Motor: as regras da agenda, separadas da tela.",
      "Garagem: o banco Supabase, que confere as regras de novo antes de gravar.",
      "Antes de ir para a pista, 77 testes automáticos; cada mudança no GitHub vai para o ar sozinha.",
    ],
    passa: "Erick, mostra o agendamento.",
  },
  {
    id: "s07-agendar",
    numero: 7,
    titulo: "Agendar em 4 curvas",
    quem: "Erick",
    segundos: 50,
    passos: ["Quatro curvas", "Zerinho e protocolo"],
    pontos: [
      "Quatro curvas: serviço, dia e hora, seus dados e revisão.",
      "Só aparecem horários livres; se alguém pega o horário em outra aba, o site avisa.",
      "No fim, um protocolo, e o carro comemora fazendo zerinho.",
      "A oficina confirma no painel e avisa pelo WhatsApp.",
    ],
    passa: "Mathias, e quem não usa mouse?",
  },
  {
    id: "s08-acessibilidade",
    numero: 8,
    titulo: "Acessibilidade",
    quem: "Mathias",
    segundos: 80,
    passos: ["Teclado", "Contraste e texto 150%", "Leitor de tela e movimento"],
    pontos: [
      "A meta foi WCAG 2.2 nível AA, com eMAG e a Lei Brasileira de Inclusão.",
      "Dá para agendar só com o teclado; o foco amarelo nunca some.",
      "O botão Acessibilidade aumenta o texto até 150%, liga alto contraste e reduz o movimento.",
      "O leitor de tela anuncia cada etapa, e erro sempre vem com texto e ícone, nunca só cor.",
    ],
  },
  {
    id: "s09-resultado",
    numero: 9,
    titulo: "Resultado",
    quem: "Mathias",
    segundos: 30,
    passos: ["Números e telas"],
    pontos: [
      "Zero violações nos testes automáticos de acessibilidade, em todas as telas.",
      "77 de 77 testes passando.",
      "No ar desde 5 de novembro, em nsc.vox.dev.br.",
    ],
    passa: "Fabio, fecha para a gente.",
  },
  {
    id: "s10-encerramento",
    numero: 10,
    titulo: "Encerramento",
    quem: "Fabio",
    segundos: 20,
    passos: ["Oito e slogan", "Obrigado e QR code"],
    pontos: [
      "Carros são nossa paixão. Competir é a obsessão.",
      "Obrigado, Neto e NSC, pela confiança, e obrigado, professores.",
      "O QR code leva ao site. Perguntas?",
    ],
  },
];

/** Tempo total previsto, em segundos (o lobby não conta). */
export const TOTAL_SEGUNDOS = CENAS.reduce((total, cena) => total + cena.segundos, 0);

/** Segundo, a partir do início, em que cada cena deveria começar. */
export const INICIO_PREVISTO: readonly number[] = CENAS.map((_, index) =>
  CENAS.slice(1, index).reduce((total, cena) => total + cena.segundos, 0),
);

/** Quem precisa agir na cena: quem fala ou, no bloco do Neto, quem conduz. */
export function responsavel(cena: Cena | undefined): Integrante | null {
  if (!cena) return null;
  if (cena.quem === "Neto") return cena.conduz ?? null;
  return cena.quem;
}

/** "02:05" a partir de segundos. */
export function relogio(segundos: number): string {
  const s = Math.max(0, Math.floor(segundos));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
