import { m } from "motion/react";
import workshopPhoto from "@/assets/images/workshop-drift.jpg";
import { MaskedLine, Reveal } from "@/components/ui/Reveal";
import { milestones } from "@/content/milestones";

const facts = [
  { label: "Fundador", value: "Neto" },
  { label: "Na pista desde", value: String(milestones[0]?.year ?? "") },
  { label: "Títulos", value: "Internacionais" },
  { label: "Especialidade", value: "Drift e competição" },
];

/**
 * Oficina: quem é a NSC. Uma foto larga do box com uma nota em painel de
 * luz, um bloco no vermelho do carrinho de ferramentas e os fatos.
 */
export function About() {
  return (
    <section id="oficina" className="about" aria-labelledby="oficina-title">
      <div className="container-site">
        <h2 id="oficina-title" className="type-head about-title">
          <MaskedLine>A última curva</MaskedLine>{" "}
          <MaskedLine delay={0.08}>ainda está longe.</MaskedLine>
        </h2>
        <Reveal order={1}>
          <p className="type-lead about-lead">
            No automobilismo, a bandeira quadriculada nunca é o fim. Com mais de uma década de
            conquistas, títulos internacionais e o pioneirismo de estruturar o drift no Brasil, a
            NSC Garage não vive do passado.
          </p>
        </Reveal>

        <div className="about-tiles grid-site">
          <figure className="about-photo">
            <div className="about-photo-frame">
              <m.img
                src={workshopPhoto}
                alt="Box da oficina com um carro sobre o elevador"
                width={1200}
                height={900}
                loading="lazy"
                initial={{ scale: 1.1 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: [0.33, 1, 0.68, 1] }}
              />
            </div>
            <figcaption className="about-note">
              O legado construído por Neto e por toda a equipe continua sendo escrito a cada motor
              ligado e a cada pneu que toca o asfalto.
            </figcaption>
          </figure>

          <div className="about-side">
            <Reveal className="about-tile" order={1}>
              <p>Pioneiros do drift no Brasil</p>
            </Reveal>
            <dl className="about-facts">
              {facts.map((fact, index) => (
                <Reveal key={fact.label} order={index + 2}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
