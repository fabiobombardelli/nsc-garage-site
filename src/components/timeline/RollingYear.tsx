type RollingYearProps = { year: number };

/**
 * Ano com dígitos que giram como um contador mecânico quando o marco entra
 * na tela. Os algarismos de cada coluna são desenhados pelo CSS; o número
 * real fica no texto para leitores de tela e buscadores.
 */
export function RollingYear({ year }: RollingYearProps) {
  const digits = String(year).split("");

  return (
    <span className="rolling-year">
      <span className="sr-only-text">{year}</span>
      <span className="rolling-year-digits" aria-hidden="true">
        {digits.map((digit, column) => (
          <span key={column} className="rolling-year-column">
            <span
              className="rolling-year-strip"
              style={{ "--digit": digit, "--column": column } as React.CSSProperties}
            />
          </span>
        ))}
      </span>
    </span>
  );
}
