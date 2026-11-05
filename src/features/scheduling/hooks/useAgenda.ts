import { useEffect, useRef, useState } from "react";
import { schedulingService } from "..";

type AgendaState<T> = { data: T | undefined; loading: boolean; error: string | null };

/**
 * Carrega dados da agenda e recarrega sozinho quando ela muda, inclusive
 * por outra aba do navegador (RF-014: a disponibilidade se atualiza na
 * hora). `key` diz quando o carregamento precisa ser refeito do zero (por
 * exemplo, ao trocar a semana exibida).
 */
export function useAgenda<T>(load: () => Promise<T>, key: string): AgendaState<T> {
  const [state, setState] = useState<AgendaState<T>>({
    data: undefined,
    loading: true,
    error: null,
  });
  // Guarda a função mais recente sem refazer a inscrição a cada desenho.
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    let active = true;
    const run = () => {
      loadRef
        .current()
        .then((data) => active && setState({ data, loading: false, error: null }))
        .catch(
          (error: unknown) =>
            active &&
            setState((current) => ({
              ...current,
              loading: false,
              error: error instanceof Error ? error.message : "Não foi possível carregar a agenda.",
            })),
        );
    };

    setState((current) => ({ ...current, loading: true }));
    run();
    const unsubscribe = schedulingService.subscribe(run);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [key]);

  return state;
}
