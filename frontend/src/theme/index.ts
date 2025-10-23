/**
 * Allegro Design System Theme
 * Main entry point for theme utilities
 */

export { ThemeProvider } from "./ThemeProvider";
export { useTheme } from "./useTheme";
export { theme } from "./utils";
export type * from "./types";

// Import theme tokens CSS
import "./tokens.css";
