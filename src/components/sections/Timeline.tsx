import { DriftCar } from "@/components/timeline/DriftCar";
import { MilestoneCard } from "@/components/timeline/MilestoneCard";
import { RaceTrack } from "@/components/timeline/RaceTrack";
import { milestones } from "@/content/milestones";
import { useDriftCar } from "@/hooks/useDriftCar";

export function Timeline() {
  const { stageRef, trackRef, pathRef, carRef } = useDriftCar();

  return (
    <section id="trajetoria" className="relative z-0 py-20 sm:py-28">
      <div className="container-site">
        <div className="relative z-20 mb-20 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Desde {milestones[0]?.year}</p>
            <h2 className="section-title mt-3">Nossa trajetória</h2>
          </div>
          <p className="hidden max-w-[34ch] text-sm leading-relaxed text-muted-foreground md:block">
            Uma estrutura construída para competir. Cada marco abaixo é uma curva do caminho que nos
            trouxe até aqui.
          </p>
        </div>

        <div ref={stageRef} className="timeline-stage relative">
          <RaceTrack svgRef={trackRef} pathRef={pathRef} />
          <DriftCar ref={carRef} />

          <ol className="relative z-10 space-y-24 sm:space-y-32">
            {milestones.map((milestone, index) => (
              <li
                key={milestone.year}
                className={`milestone ${index % 2 ? "milestone-left" : "milestone-right"}`}
              >
                <MilestoneCard milestone={milestone} position={index + 1} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
