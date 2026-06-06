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

export const useColors = (): Colors => useContext(ThemeCtx);
