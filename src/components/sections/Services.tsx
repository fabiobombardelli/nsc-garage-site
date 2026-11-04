import { services } from "@/content/services";

export function Services() {
  return (
    <section id="servicos" className="relative z-30 bg-background py-20 sm:py-28">
      <div className="container-site">
        <div className="mb-12 flex flex-col gap-4 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">O que fazemos</p>
            <h2 className="section-title mt-3">Serviços</h2>
          </div>
          <p className="max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
            Do carro de rua ao de competição, cada projeto recebe o mesmo método: diagnóstico,
            planejamento, execução e validação.
          </p>
        </div>

        <ul className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ title, description, icon: Icon }) => (
            <li key={title} className="service-card reveal">
              <Icon className="text-primary" size={28} strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-6 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
