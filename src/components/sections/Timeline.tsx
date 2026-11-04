import { DriftCar } from "@/components/timeline/DriftCar";
import { Milestone } from "@/components/timeline/Milestone";
import { RaceTrack } from "@/components/timeline/RaceTrack";
import { InlineClip } from "@/components/ui/InlineClip";
import { milestones } from "@/content/milestones";
import { useDriftCar } from "@/hooks/useDriftCar";
import { slideLoop } from "@/lib/assets";

export function Timeline() {
  const { geometry, stageRef, listRef, pathRef, tyreMarksRef, clippingRef, carRef } = useDriftCar();
  const firstYear = milestones[0]?.year;

  return (
    <section id="trajetoria" className="timeline">
      <div className="timeline-intro">
        <div className="container-site grid-site gap-y-10">
          {/* "Andar de lado" é como se diz drift no Brasil: o vídeo ocupa o lugar de "lado". */}
          <h2 className="timeline-title type-display" data-reveal="drift">
            Andamos de <InlineClip word="lado" {...slideLoop} />
            <br />
            desde {firstYear}
          </h2>
          <p className="timeline-lede type-lead" data-reveal="rise">
            Mais de uma década entre o box e a pista. Cada marco é um clipping point da nossa
            história, e o 350Z #69 passa por todos.
          </p>
        </div>
      </div>

      <div className="container-site">
        <div ref={stageRef} className="timeline-stage">
          {geometry && (
            <RaceTrack
              geometry={geometry}
              pathRef={pathRef}
              tyreMarksRef={tyreMarksRef}
              clippingRef={clippingRef}
            />
          )}
          <DriftCar ref={carRef} className="timeline-car" />

          <ol ref={listRef} className="milestones">
            {milestones.map((milestone, index) => (
              <li
                key={milestone.year}
                className="milestone"
                data-side={index % 2 === 0 ? "right" : "left"}
                data-reveal="group"
              >
                <Milestone milestone={milestone} />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
