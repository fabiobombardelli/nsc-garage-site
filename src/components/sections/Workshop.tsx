import workshopImage from "@/assets/images/workshop-drift.jpg";

export function Workshop() {
  return (
    <section id="oficina" className="relative z-30 isolate border-y border-border bg-secondary">
      <div className="container-site grid gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <img
          src={workshopImage}
          alt="Oficina de preparação com carro sobre elevador"
          width={1200}
          height={900}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />

        <div className="space-y-6 text-muted-foreground [&>p]:max-w-[48ch] [&>p]:leading-relaxed">
          <h2 className="section-title text-foreground">A última curva ainda está longe.</h2>
          <p>
            No automobilismo, a bandeira quadriculada nunca é o fim, mas sim o ponto de largada para
            o próximo desafio. Com mais de uma década de conquistas, títulos internacionais e o
            pioneirismo de estruturar o drift no Brasil, a NSC Garage não vive do passado. Nosso
            motor continua em alta rotação, sempre com os olhos cravados no futuro da performance.
          </p>
          <p>
            O legado construído por Neto e por toda a equipe da NSC Garage continua sendo escrito a
            cada motor ligado e a cada pneu que toca o asfalto. A última curva ainda está longe, e
            nós temos a estrutura perfeita para você acelerar conosco nessa reta.
          </p>
        </div>
      </div>
    </section>
  );
}
