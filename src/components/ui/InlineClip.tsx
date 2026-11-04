import type { VideoSource } from "@/lib/assets";

type InlineClipProps = {
  /** A palavra que o vídeo substitui na frase. Leitores de tela leem esta palavra. */
  word: string;
  poster: string;
  sources: VideoSource[];
};

/** Um trecho de vídeo do tamanho de uma palavra, encaixado no meio de um título. */
export function InlineClip({ word, poster, sources }: InlineClipProps) {
  return (
    <>
      <span className="inline-clip" aria-hidden="true">
        <video poster={poster} autoPlay muted loop playsInline preload="metadata">
          {sources.map((source) => (
            <source key={source.src} {...source} />
          ))}
        </video>
      </span>
      <span className="sr-only-text">{word}</span>
    </>
  );
}
