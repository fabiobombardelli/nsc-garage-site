import { Logo } from "@/components/ui/Logo";
import { navigation, site } from "@/content/site";

export function Footer() {
  return (
    <footer className="bg-card">
      <div className="container-site flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo className="h-14" />
          <p className="mt-3 max-w-[40ch] text-sm text-muted-foreground">{site.shortDescription}</p>
        </div>

        <nav aria-label="Rodapé" className="flex flex-wrap gap-x-6 gap-y-3">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-border px-5 py-5 text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        © {new Date().getFullYear()} {site.name} · Todos os direitos reservados
      </div>
    </footer>
  );
}
