import type { Milestone } from "@/content/milestones";

type MilestoneCardProps = {
  milestone: Milestone;
  /** Número do marco (1, 2, 3…), exibido como "Marco 01". */
  position: number;
};

export function MilestoneCard({ milestone, position }: MilestoneCardProps) {
  const shortYear = String(milestone.year).slice(-2);

  return (
    <article className="milestone-card">
      <img src={milestone.image} alt={milestone.title} width={1200} height={900} loading="lazy" />
      <div className="p-6">
        <span className="font-display text-5xl leading-none text-primary sm:text-6xl">
          ’{shortYear}
        </span>
        <p className="mt-3 text-[10px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
          Marco {String(position).padStart(2, "0")}
        </p>
        <h3 className="mt-2 text-lg font-semibold">{milestone.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{milestone.text}</p>
      </div>
    </article>
  );
}
