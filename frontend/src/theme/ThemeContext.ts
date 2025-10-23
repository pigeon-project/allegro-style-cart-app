/**
 * Theme Context definition
 */

import { createContext } from "react";
import type { ThemeMode } from "./types";

export interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined,
);
