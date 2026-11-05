import { lazy, type ComponentType } from "react";

/**
 * Tela carregada sob demanda: o código das telas internas (agendar, painel,
 * acessibilidade...) fica fora do arquivo inicial, que só precisa da página
 * inicial (RNF-03). `preload` baixa o código antes da visita; depois disso a
 * tela abre na hora, sem passar pelo Suspense.
 */
export function lazyPage<P extends object>(load: () => Promise<ComponentType<P>>) {
  let loaded: ComponentType<P> | null = null;
  let pending: Promise<ComponentType<P>> | null = null;
  const preload = () =>
    (pending ??= load()
      .then((component) => (loaded = component))
      .catch((error: unknown) => {
        pending = null; // Falhou (rede): tenta de novo na próxima vez.
        throw error;
      }));
  const Lazy = lazy(() => preload().then((component) => ({ default: component })));

  function Page(props: P) {
    const Loaded = loaded;
    return Loaded ? <Loaded {...props} /> : <Lazy {...props} />;
  }
  return Object.assign(Page, { preload });
}
