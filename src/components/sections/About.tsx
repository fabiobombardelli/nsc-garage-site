import frontPhoto from "@/assets/images/footage/front-69.webp";

const facts = [
  { label: "Fundador", value: "Neto" },
  { label: "Na pista", value: "Títulos internacionais" },
  { label: "No Brasil", value: "Pioneiros na estruturação do drift" },
];

/** Quem é a NSC: o texto em tamanho grande, com a foto do #69 encaixada como capitular. */
export function About() {
  return (
    <section id="oficina" className="about">
      <div className="container-site grid-site about-grid">
        <dl className="about-facts">
          {facts.map((fact, index) => (
            <div
              key={fact.label}
              data-reveal="rise"
              style={{ "--reveal-order": index } as React.CSSProperties}
            >
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>

        <div className="about-body">
          <h2 className="type-head" data-reveal="drift">
            A última curva ainda está longe.
          </h2>

          <p className="about-statement type-lead" data-reveal="rise">
            <img
              className="about-portrait"
              src={frontPhoto}
              alt="O 350Z #69 da NSC saindo de lado da curva"
              width={900}
              height={900}
              loading="lazy"
            />
            No automobilismo, a bandeira quadriculada nunca é o fim. Com mais de uma década de
            conquistas, títulos internacionais e o pioneirismo de estruturar o drift no Brasil, a
            NSC Garage não vive do passado.
          </p>
          <p className="about-statement about-statement-soft type-lead" data-reveal="rise">
            O legado construído por Neto e por toda a equipe continua sendo escrito a cada motor
            ligado e a cada pneu que toca o asfalto.
          </p>

          <a href="#contato" className="text-link about-link" data-reveal="rise">
            Fale com a equipe
          </a>
        </div>
      </div>
    </section>
  );
}
