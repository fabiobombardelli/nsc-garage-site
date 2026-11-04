import type { Milestone as MilestoneData } from "@/content/milestones";
import { RollingYear } from "./RollingYear";

type MilestoneProps = { milestone: MilestoneData };

/** Um marco da trajetória: foto, ano, título e uma frase. Sem caixa nem sombra. */
export function Milestone({ milestone }: MilestoneProps) {
  return (
    <article className="milestone-content">
      <div className="milestone-photo">
        <img
          src={milestone.image}
          alt={milestone.imageAlt}
          width={1500}
          height={1000}
          loading="lazy"
        />
      </div>
      <p className="milestone-year type-head">
        <RollingYear year={milestone.year} />
      </p>
      <h3 className="milestone-title type-lead">{milestone.title}</h3>
      <p className="milestone-text">{milestone.text}</p>
    </article>
  );
}
