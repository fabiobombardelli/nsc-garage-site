/**
 * Informações gerais da marca. Edite aqui para atualizar textos que
 * aparecem em mais de um lugar do site (header, rodapé, contato…).
 */
export const site = {
  name: "NSC Garage",
  description: "Preparação de carros de drift e competição e manutenção premium de esportivos.",
  /** Nome da ação principal. Use o mesmo texto em todos os botões que levam ao contato. */
  primaryAction: "Agendar avaliação",
  /**
   * Slogan da marca. INEGOCIÁVEL: aparece sempre completo, nas duas frases,
   * sem cortes nem reescrita (pedido do cliente).
   */
  tagline: ["Carros são nossa paixão.", "Competir é a obsessão."],
} as const;

/**
 * Dados de contato.
 * TODO: substituir pelos dados reais da oficina antes de publicar.
 */
export const contact = {
  whatsapp: {
    /** Só números, com DDI 55 + DDD. Ex.: "5511987654321". */
    number: "5500000000000",
    display: "(00) 00000-0000",
  },
  /** Usuário do Instagram sem o @. Deixe vazio para esconder. */
  instagram: "",
  address: {
    street: "Endereço da oficina",
    city: "Cidade, UF",
  },
  hours: ["Segunda a sexta, 8h às 18h", "Sábado, 8h às 12h"],
} as const;

export type NavItem = {
  label: string;
  href: `#${string}`;
};

/** Links do menu. A ação principal (contato) é um botão à parte. */
export const navigation: NavItem[] = [
  { label: "Trajetória", href: "#trajetoria" },
  { label: "Oficina", href: "#oficina" },
  { label: "Serviços", href: "#servicos" },
];
