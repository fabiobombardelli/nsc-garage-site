import { m } from "motion/react";
import workshopPhoto from "@/assets/images/workshop-drift.jpg";
import { MaskedLine, Reveal } from "@/components/ui/Reveal";
import { milestones } from "@/content/milestones";

/**
 * Fatos da oficina. Fonte: pesquisa da equipe em fontes públicas
 * (04/11/2026); a sigla foi informada pela própria equipe NSC.
 * Só entram fatos confirmados por duas ou mais fontes.
 */
const facts = [
  { label: "Fundador", value: "Neto (Walter Santana Neto)" },
  { label: "NSC", value: "Neto Street Car" },
  { label: "Na pista desde", value: String(milestones[0]?.year ?? "") },
  { label: "Super Drift Brasil", value: "6 títulos seguidos, 2015 a 2020" },
  { label: "Brasileiro de Drift", value: "4 títulos seguidos, 2016 a 2019" },
  { label: "Mundial", value: "Vice no King of Nations, 2016" },
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
            conquistas, um vice-campeonato mundial, o título do Hyperdrive na Netflix e o Super
            Drift Brasil, criado pelo próprio Neto, a NSC Garage não vive do passado.
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
