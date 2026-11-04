import { site } from "@/content/site";
import { logoUrl } from "@/lib/assets";
import { cn } from "@/lib/cn";

type LogoProps = { className?: string };

/** Logo da marca. Usa o arquivo de `src/assets/brand/` ou, na falta dele, o nome em texto. */
export function Logo({ className }: LogoProps) {
  if (logoUrl) {
    return <img src={logoUrl} alt={site.name} className={cn("w-auto", className)} />;
  }

  return (
    <span className={cn("logo-wordmark", className)} aria-label={site.name}>
      <span className="text-primary">NSC</span> Garage
    </span>
  );
}
