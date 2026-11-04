/**
 * Informações gerais da marca. Edite aqui para atualizar textos que
 * aparecem em mais de um lugar do site (header, footer, etc.).
 */
export const site = {
  name: "NSC Garage",
  tagline: "Preparação e manutenção premium",
  shortDescription: "Oficina premium de preparação para drift.",
} as const;

export type NavItem = {
  label: string;
  href: `#${string}`;
  /** Esconde o link em telas pequenas para não apertar o menu. */
  hideOnMobile?: boolean;
};

export const navigation: NavItem[] = [
  { label: "Início", href: "#inicio" },
  { label: "Trajetória", href: "#trajetoria" },
  { label: "Oficina", href: "#oficina", hideOnMobile: true },
  { label: "Contato", href: "#contato" },
];
