import { m, type HTMLMotionProps } from "motion/react";
import type { ReactNode } from "react";

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

type RevealProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  /** Ordem dentro de um grupo (0, 1, 2…): cada passo atrasa 80 ms. */
  order?: number;
};

/**
 * Bloco que sobe e aparece uma única vez ao entrar na tela.
 * Com movimento reduzido, só a opacidade muda.
 */
export function Reveal({ children, order = 0, ...props }: RevealProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.9, ease: EASE_EXPO, delay: order * 0.08 }}
      {...props}
    >
      {children}
    </m.div>
  );
}

type MaskedLineProps = {
  children: ReactNode;
  /** Atraso em segundos. */
  delay?: number;
  /** Anima ao carregar (topo da página) em vez de ao entrar na tela. */
  onLoad?: boolean;
  className?: string;
};

const lineVariants = {
  hidden: { y: "105%" },
  shown: { y: "0%" },
};

/**
 * Uma linha de título que sobe de dentro de uma máscara, como uma placa
 * sendo erguida. O texto continua no documento o tempo todo (leitores de
 * tela e buscadores o leem normalmente).
 *
 * Quem observa a entrada na tela é a máscara, que está sempre no fluxo:
 * o texto escondido dentro dela não seria visto pelo IntersectionObserver
 * quando o título quebra em várias linhas (fonte ampliada, celular).
 */
export function MaskedLine({ children, delay = 0, onLoad = false, className }: MaskedLineProps) {
  return (
    <m.span
      className={className ? `masked-line ${className}` : "masked-line"}
      initial="hidden"
      animate={onLoad ? "shown" : undefined}
      whileInView={onLoad ? undefined : "shown"}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      <m.span
        className="masked-line-inner"
        variants={lineVariants}
        transition={{ duration: 1, ease: EASE_EXPO, delay }}
      >
        {children}
      </m.span>
    </m.span>
  );
}
