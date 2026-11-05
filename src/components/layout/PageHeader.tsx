import type { ReactNode } from "react";
import { MaskedLine } from "@/components/ui/Reveal";

type PageHeaderProps = {
  title: string;
  lead?: ReactNode;
  /** Ações ao lado do título (por exemplo, "Sair" no painel). */
  actions?: ReactNode;
};

/**
 * Abertura das telas internas: o título (h1) em letra de monumento e uma
 * frase de apoio. O h1 recebe o foco a cada troca de tela
 * (`data-page-title`, ver app/useRouteFocus.ts).
 */
export function PageHeader({ title, lead, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-main">
        <h1 className="type-head page-title" tabIndex={-1} data-page-title>
          <MaskedLine onLoad>{title}</MaskedLine>
        </h1>
        {lead && <p className="type-lead page-lead">{lead}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
