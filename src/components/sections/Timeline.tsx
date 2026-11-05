import { m } from "motion/react";
import openingPhoto from "@/assets/images/history/abertura-r34-fumaca.webp";
import { DriftCar } from "@/components/car/DriftCar";
import { FloorLane } from "@/components/timeline/FloorLane";
import { Milestone } from "@/components/timeline/Milestone";
import { href } from "@/app/router";
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
      return { label: `${first.year}–${last.year}`, href: `#marco-${first.id}` };
    });
}

/**
 * Trajetória: uma foto de pista abre a seção numa faixa escura e, abaixo, o
 * piso do box com a pista por onde o carro derrapa conforme a página rola.
 * A pista começa por baixo da faixa, então pista e carro saem de trás dela.
 * O título conta a origem: Neto conheceu o drift no Japão, trouxe para
 * Santos, e a oficina levou o trabalho ao mundo.
 */
export function Timeline() {
  const { geometry, stageRef, listRef, pathRef, tyreMarksRef, conesRef, carRef } = useDriftCar();
  const first = milestones[0];
  const eras = getEras();

  return (
    <section id="trajetoria" className="timeline" aria-labelledby="trajetoria-title">
      {/* Faixa escura de ponta a ponta: a pista e o carro saem de baixo dela. */}
      <div className="timeline-opening">
        <figure className="plate-photo">
          <m.img
            src={openingPhoto}
            alt="Skyline R34 preto preparado pela NSC desaparecendo na fumaça dos pneus, no King of Nations de 2016"
            width={1500}
            height={1002}
            loading="lazy"
            initial={{ opacity: 0, scale: 1.08 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -15% 0px" }}
            transition={{ duration: 1.4, ease: [0.33, 1, 0.68, 1] }}
          />
        </figure>
        <div className="plate container-site grid-site">
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
                <MaskedLine>Do Japão a Santos.</MaskedLine>{" "}
                <MaskedLine delay={0.08}>De Santos para o mundo.</MaskedLine>
              </h2>
              <Reveal order={2}>
                <p className="type-lead">
                  Neto conheceu o drift morando no Japão e trouxe a paixão para a Baixada Santista.
                  Desde {first?.year}, cada marco é um cone no traçado, e o 350Z passa por todos.
                </p>
              </Reveal>
            </div>

            <div className="plate-actions">
              <a href={`#marco-${first?.id}`} className="plate-cell plate-cell-light">
                Ver os marcos
              </a>
              <a href={href("agendar")} className="plate-cell">
                {site.primaryAction}
              </a>
            </div>
            <p className="plate-credit">Foto da abertura: Drifted</p>
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
                key={milestone.id}
                id={`marco-${milestone.id}`}
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
