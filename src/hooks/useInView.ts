import { useEffect, useState, type RefObject } from "react";

/** Indica se o elemento está visível na tela (`once` mantém `true` depois da primeira vez). */
export function useInView(
  ref: RefObject<Element | null>,
  { threshold = 0.3, once = false }: { threshold?: number; once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold, once]);

  return inView;
}
