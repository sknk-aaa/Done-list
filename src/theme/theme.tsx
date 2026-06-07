import { createContext, useContext, type ReactNode } from 'react';

import { useAppStore } from '@/state/store';

import { darkColors, lightColors, type Colors } from './tokens';

export type { Colors } from './tokens';

const ThemeCtx = createContext<Colors>(lightColors);

/** Dark theme is a Pro feature: only applies when enabled AND Pro. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const dark = useAppStore((s) => s.darkMode && s.isPro);
  return <ThemeCtx.Provider value={dark ? darkColors : lightColors}>{children}</ThemeCtx.Provider>;
}

export const useColors = (): Colors => {
  const base = useContext(ThemeCtx);
  // Dev-only live theme editing (web theme-editor injects overrides via the store).
  const override = useAppStore((s) => s.themeOverride);
  return __DEV__ && override ? { ...base, ...override } : base;
};
