import { Logo } from "@/components/ui/Logo";
import { navigation, site } from "@/content/site";
import { cn } from "@/lib/cn";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 border-b border-foreground/10">
      <div className="container-site flex items-center justify-between gap-5 py-3 sm:py-5">
        <a
          href="#inicio"
          aria-label={`${site.name} — início`}
          className="flex min-w-0 items-center gap-2"
        >
          <Logo className="h-10 sm:h-12 lg:h-14" />
          <span className="hidden h-6 w-px bg-foreground/25 sm:block" />
          <span className="hidden text-[10px] font-medium tracking-[0.28em] text-muted-foreground uppercase lg:block">
            {site.tagline}
          </span>
        </a>

        <nav aria-label="Navegação principal" className="flex items-center gap-1 sm:gap-2">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn("nav-link", item.hideOnMobile && "hidden sm:block")}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
