/**
 * Theme Provider for Allegro Design System
 * Manages theme mode (light/dark) switching
 */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { ThemeMode } from "./types";
import { ThemeContext } from "./ThemeContext";
import type { ThemeContextValue } from "./ThemeContext";

interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
}

/**
 * Get the initial theme mode from localStorage or system preference
 */
function getInitialMode(): ThemeMode {
  // Check localStorage first
  const stored = localStorage.getItem("theme-mode");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Fall back to system preference if matchMedia is available
  if (typeof window !== "undefined" && window.matchMedia) {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  }

  return "light";
}

/**
 * Theme Provider component
 */
export function ThemeProvider({ children, defaultMode }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(
    defaultMode ?? getInitialMode(),
  );

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme-mode", mode);
  }, [mode]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function handleChange(e: MediaQueryListEvent) {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem("theme-mode");
      if (!stored) {
        setModeState(e.matches ? "dark" : "light");
      }
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  const toggleMode = () => {
    setModeState((current) => (current === "light" ? "dark" : "light"));
  };

  const value: ThemeContextValue = {
    mode,
    setMode,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
