/**
 * Preferências de acessibilidade do site.
 *
 * O site já respeita as preferências do sistema operacional (movimento
 * reduzido e contraste alto). Um painel de acessibilidade futuro só
 * precisa chamar `setAccessibilityPreferences()`; todo o resto já reage.
 *
 * As preferências chegam ao CSS como atributos no elemento <html>:
 *
 *   data-motion="reduce" | "full"     → animações e vídeo automático
 *   data-contrast="high" | "normal"   → tema de alto contraste (theme.css)
 *   --font-scale: 1 | 1.125 | 1.25 | 1.5  → tamanho de todo o texto
 *
 * Para testar sem o painel, use parâmetros na URL (ficam salvos neste
 * navegador): ?movimento=reduzido · ?contraste=alto · ?fonte=125
 * Para voltar ao padrão: ?acessibilidade=padrao
 */

export type MotionPreference = "system" | "reduce" | "full";
export type ContrastPreference = "system" | "high" | "normal";

export type AccessibilityPreferences = {
  motion: MotionPreference;
  contrast: ContrastPreference;
  /** Multiplicador do tamanho de todo o texto. */
  fontScale: number;
};

/** Escalas de fonte oferecidas. 1.5 ainda mantém o layout íntegro. */
export const FONT_SCALES = [1, 1.125, 1.25, 1.5] as const;

const STORAGE_KEY = "nsc:acessibilidade";
const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  motion: "system",
  contrast: "system",
  fontScale: 1,
};

const reducedMotionQuery = () => window.matchMedia("(prefers-reduced-motion: reduce)");
const highContrastQuery = () => window.matchMedia("(prefers-contrast: more)");

function clampFontScale(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(1.5, Math.max(1, value));
}

/** Lê as preferências salvas. Nunca falha: sem armazenamento, usa o padrão. */
export function getAccessibilityPreferences(): AccessibilityPreferences {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(stored) as Partial<AccessibilityPreferences>;
    return {
      motion: parsed.motion ?? "system",
      contrast: parsed.contrast ?? "system",
      fontScale: clampFontScale(Number(parsed.fontScale ?? 1)),
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/** Traduz as preferências em atributos no <html>. */
export function applyAccessibilityPreferences(
  preferences: AccessibilityPreferences = getAccessibilityPreferences(),
) {
  const root = document.documentElement;
  const reduceMotion =
    preferences.motion === "reduce" ||
    (preferences.motion === "system" && reducedMotionQuery().matches);
  const highContrast =
    preferences.contrast === "high" ||
    (preferences.contrast === "system" && highContrastQuery().matches);

  root.dataset.motion = reduceMotion ? "reduce" : "full";
  root.dataset.contrast = highContrast ? "high" : "normal";
  root.style.setProperty("--font-scale", String(clampFontScale(preferences.fontScale)));
}

/** Altera e salva preferências (ponto de entrada do futuro painel de acessibilidade). */
export function setAccessibilityPreferences(changes: Partial<AccessibilityPreferences>) {
  const next = { ...getAccessibilityPreferences(), ...changes };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Navegação privada ou armazenamento bloqueado: vale só para esta visita.
  }
  applyAccessibilityPreferences(next);
}

/** Aplica preferências passadas na URL (útil para testes e para o cliente conferir os modos). */
function applyUrlPreferences() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("acessibilidade") === "padrao") {
    setAccessibilityPreferences(DEFAULT_PREFERENCES);
    return;
  }

  const changes: Partial<AccessibilityPreferences> = {};
  const motion = params.get("movimento");
  if (motion === "reduzido") changes.motion = "reduce";
  if (motion === "completo") changes.motion = "full";
  const contrast = params.get("contraste");
  if (contrast === "alto") changes.contrast = "high";
  if (contrast === "normal") changes.contrast = "normal";
  const font = Number(params.get("fonte"));
  if (font) changes.fontScale = font / 100;

  if (Object.keys(changes).length > 0) setAccessibilityPreferences(changes);
}

/**
 * Inicializa tudo: aplica o que estiver salvo ou na URL e passa a seguir
 * mudanças nas preferências do sistema. Chamado uma vez em main.tsx.
 */
export function initAccessibility() {
  applyAccessibilityPreferences();
  applyUrlPreferences();
  const reapply = () => applyAccessibilityPreferences();
  reducedMotionQuery().addEventListener("change", reapply);
  highContrastQuery().addEventListener("change", reapply);
}
