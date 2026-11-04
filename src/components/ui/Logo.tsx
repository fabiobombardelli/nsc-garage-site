import logoImage from "@/assets/brand/logo.webp";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

type LogoProps = { className?: string };

export function Logo({ className }: LogoProps) {
  return (
    <img
      src={logoImage}
      alt={site.name}
      width={640}
      height={261}
      className={cn("w-auto", className)}
    />
  );
}
