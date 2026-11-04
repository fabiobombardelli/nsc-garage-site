/**
 * Informações gerais da marca. Edite aqui para atualizar textos que
 * aparecem em mais de um lugar do site (header, footer, contato…).
 */
export const site = {
  name: "NSC Garage",
  tagline: "Preparação e manutenção premium",
  shortDescription: "Oficina premium de manutenção e preparação de carros de competição e drift.",
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
  /** Deixe vazio para esconder. */
  email: "",
  address: {
    street: "Endereço da oficina",
    city: "Cidade — UF",
    /** Link do Google Maps. Deixe vazio para não exibir o link "Como chegar". */
    mapsUrl: "",
  },
  hours: ["Segunda a sexta · 8h às 18h", "Sábado · 8h às 12h"],
} as const;

export type NavItem = {
  label: string;
  href: `#${string}`;
};

export const navigation: NavItem[] = [
  { label: "Início", href: "#inicio" },
  { label: "Trajetória", href: "#trajetoria" },
  { label: "Oficina", href: "#oficina" },
  { label: "Serviços", href: "#servicos" },
  { label: "Contato", href: "#contato" },
];
