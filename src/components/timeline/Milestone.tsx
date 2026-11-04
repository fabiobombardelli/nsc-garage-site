import { useRef } from "react";
import type { Milestone as MilestoneData } from "@/content/milestones";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";
import { RollingYear } from "./RollingYear";

type MilestoneProps = { milestone: MilestoneData };

/**
 * Um marco da trajetória: foto, ano, título e uma frase, direto sobre o
 * piso (sem caixa nem sombra). Ao entrar na tela, a foto abre, o ano gira
 * e o texto sobe (ver timeline.css).
 */
export function Milestone({ milestone }: MilestoneProps) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { threshold: 0.2, once: true });

  return (
    <article ref={ref} className={cn("milestone-content", seen && "is-in")}>
      <div className="milestone-photo">
        <img
          src={milestone.image}
          alt={milestone.imageAlt}
          width={1500}
          height={1000}
          loading="lazy"
        />
      </div>
      <p className="milestone-year">
        <RollingYear year={milestone.year} />
      </p>
      <h3 className="milestone-title">{milestone.title}</h3>
      <p className="milestone-text">{milestone.text}</p>
    </article>
  );
}
