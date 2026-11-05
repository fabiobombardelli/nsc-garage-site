import { useSyncExternalStore } from "react";
import { PREFERENCES_EVENT, getEffectivePreferences } from "@/lib/accessibility";

/** Preferências de acessibilidade em vigor; o componente redesenha quando mudam. */
export function useAccessibilityPreferences() {
  return useSyncExternalStore(subscribe, getEffectivePreferences, getEffectivePreferences);
}

function subscribe(onChange: () => void) {
  window.addEventListener(PREFERENCES_EVENT, onChange);
  return () => window.removeEventListener(PREFERENCES_EVENT, onChange);
}
