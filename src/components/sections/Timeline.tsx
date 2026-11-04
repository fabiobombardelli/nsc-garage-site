import { m } from "motion/react";
import slidePhoto from "@/assets/images/footage/slide-square.webp";
import { DriftCar } from "@/components/timeline/DriftCar";
import { FloorLane } from "@/components/timeline/FloorLane";
import { Milestone } from "@/components/timeline/Milestone";
import { MaskedLine, Reveal } from "@/components/ui/Reveal";
import { milestones } from "@/content/milestones";
import { site } from "@/content/site";
import { useDriftCar } from "@/hooks/useDriftCar";

/** Divide os marcos em três épocas para os atalhos do topo da seção. */
function getEras() {
  const size = Math.ceil(milestones.length / 3);
  return [0, 1, 2]
    .map((index) => milestones.slice(index * size, (index + 1) * size))
    .filter((era) => era.length > 0)
    .map((era) => {
      const first = era[0]!;
      const last = era[era.length - 1]!;
      return { label: `${first.year}–${last.year}`, href: `#marco-${first.year}` };
    });
}

/**
 * Trajetória: a foto do 350Z abre a seção e, abaixo, o piso do box com a
 * faixa pintada por onde o carro derrapa conforme a página rola.
 */
export function Timeline() {
  const { geometry, stageRef, listRef, pathRef, tyreMarksRef, conesRef, carRef } = useDriftCar();
  const firstYear = milestones[0]?.year;
  const eras = getEras();

  return (
    <section id="trajetoria" className="timeline" aria-labelledby="trajetoria-title">
      <div className="plate container-site">
        <figure className="plate-photo">
          <m.img
            src={slidePhoto}
            alt="O 350Z #69 da NSC passando de lado em meio à fumaça"
            width={1100}
            height={1100}
            loading="lazy"
            initial={{ opacity: 0, scale: 1.08 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.4, ease: [0.33, 1, 0.68, 1] }}
          />
        </figure>

        <div className="plate-text">
          <nav aria-label="Épocas da trajetória" className="plate-tabs">
            {eras.map((era) => (
              <a key={era.href} href={era.href} className="plate-tab">
                {era.label}
              </a>
            ))}
          </nav>

          <div className="plate-copy">
            <h2 id="trajetoria-title" className="type-head">
              <MaskedLine>Andamos de lado</MaskedLine>{" "}
              <MaskedLine delay={0.08}>desde {firstYear}</MaskedLine>
            </h2>
            <Reveal order={2}>
              <p className="type-lead">
                Mais de uma década entre o box e a pista. Cada marco é um cone no traçado, e o 350Z
                #69 passa por todos.
              </p>
            </Reveal>
          </div>

          <div className="plate-actions">
            <a href={`#marco-${firstYear}`} className="plate-cell plate-cell-light">
              Ver os marcos
            </a>
            <a href="#contato" className="plate-cell">
              {site.primaryAction}
            </a>
          </div>
        </div>
      </div>

      <div className="container-site">
        <div ref={stageRef} className="timeline-stage">
          {geometry && (
            <FloorLane
              geometry={geometry}
              pathRef={pathRef}
              tyreMarksRef={tyreMarksRef}
              conesRef={conesRef}
            />
          )}
          <DriftCar ref={carRef} className="timeline-car" />

          <ol ref={listRef} className="milestones" aria-label="Marcos da trajetória">
            {milestones.map((milestone, index) => (
              <li
                key={milestone.year}
                id={`marco-${milestone.year}`}
                tabIndex={-1}
                className="milestone"
                data-side={index % 2 === 0 ? "right" : "left"}
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
