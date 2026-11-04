import { Logo } from "@/components/ui/Logo";
import { site } from "@/content/site";

export function Footer() {
  return (
    <footer id="contato" className="bg-card">
      <div className="container-site flex flex-col gap-6 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-12">
        <div>
          <Logo className="h-12 sm:h-14 lg:h-16" />
          <p className="mt-2 text-sm text-muted-foreground">{site.shortDescription}</p>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Contato e endereço serão inseridos na próxima revisão.</p>
          <a
            href="#inicio"
            className="mt-3 inline-block font-semibold tracking-[0.18em] text-foreground uppercase"
          >
            Voltar ao topo ↑
          </a>
        </div>
      </div>

      <div className="border-t border-border px-5 py-5 text-center text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        © {new Date().getFullYear()} {site.name}
      </div>
    </footer>
  );
}
