import { useRef, useState } from "react";
import type { Milestone as MilestoneData } from "@/content/milestones";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/cn";
import { RollingYear } from "./RollingYear";

type MilestoneProps = { milestone: MilestoneData };

/** Separa a primeira frase do resto do texto (o resto abre em "Ler mais"). */
function splitLead(text: string): [string, string] {
  const match = text.match(/^(.+?[.!?])\s+(.+)$/s);
  return match ? [match[1] ?? text, match[2] ?? ""] : [text, ""];
}

/**
 * Um marco da trajetória: foto (com crédito), o ano em destaque com a data
 * pequena ao lado, título e texto, direto sobre o piso. Ao entrar na tela,
 * a foto abre, o ano gira e o texto sobe (ver timeline.css).
 *
 * Texto longo: a primeira frase aparece e "Ler mais" mostra o resto no
 * próprio card (padrão disclosure: botão com `aria-expanded`). A pista se
 * redesenha sozinha quando o card cresce.
 */
export function Milestone({ milestone }: MilestoneProps) {
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { threshold: 0.2, once: true });
  const [open, setOpen] = useState(false);
  const [lead, more] = splitLead(milestone.text);
  const textId = `marco-${milestone.id}-texto`;
  const { photo } = milestone;

  return (
    <article
      ref={ref}
      className={cn("milestone-content", seen && "is-in", !photo && "is-text-only")}
    >
      {photo && (
        <figure className="milestone-figure">
          <div className="milestone-photo">
            <img src={photo.src} alt={photo.alt} width={1500} height={1000} loading="lazy" />
          </div>
          <figcaption className="milestone-credit">Foto: {photo.credit}</figcaption>
        </figure>
      )}
      <p className="milestone-when">
        <span className="milestone-year">
          <RollingYear year={milestone.year} />
        </span>
        <span className="milestone-date">{milestone.date}</span>
      </p>
      <h3 className="milestone-title">{milestone.title}</h3>
      <p id={textId} className="milestone-text">
        {lead}
        {more && open && <> {more}</>}
      </p>
      {more && (
        <button
          type="button"
          className="text-link milestone-more"
          aria-expanded={open}
          aria-controls={textId}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Ler menos" : "Ler mais"}
          <span className="sr-only-text"> sobre {milestone.title.toLowerCase()}</span>
        </button>
      )}
    </article>
  );
}
