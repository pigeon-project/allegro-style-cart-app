/**
 * Utility functions for working with Allegro Design System theme tokens
 */

import type {
  ColorPalette,
  ColorScale,
  SemanticColor,
  SemanticBorderRadius,
  SemanticOpacity,
} from "./types";

/**
 * Get a CSS custom property value from the document
 */
function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * Get a color from the palette
 */
export function getColor(palette: ColorPalette, scale: ColorScale): string {
  return getCSSVariable(`--m-color-${palette}-${scale}`);
}

/**
 * Get a semantic color
 */
export function getSemanticColor(color: SemanticColor): string {
  return getCSSVariable(`--m-color-${color}`);
}

/**
 * Get an opacity value
 */
export function getOpacity(opacity: SemanticOpacity | string): string {
  return getCSSVariable(`--m-opacity-${opacity}`);
}

/**
 * Get a border radius value
 */
export function getBorderRadius(radius: SemanticBorderRadius | string): string {
  return getCSSVariable(`--m-border-radius-${radius}`);
}

/**
 * Create a CSS variable reference for use in styles
 */
export function cssVar(name: string): string {
  return `var(--${name})`;
}

/**
 * Create an rgba color using theme tokens
 */
export function rgba(rgbVar: string, opacity: number | string): string {
  if (typeof opacity === "number") {
    return `rgba(var(--${rgbVar}), ${opacity})`;
  }
  return `rgba(var(--${rgbVar}), var(--m-opacity-${opacity}))`;
}

/**
 * Get all current theme token values
 */
export function getAllThemeTokens(): Record<string, string> {
  const tokens: Record<string, string> = {};
  const styles = getComputedStyle(document.documentElement);

  // Get all CSS custom properties starting with --m-
  for (let i = 0; i < styles.length; i++) {
    const name = styles[i];
    if (name.startsWith("--m-")) {
      tokens[name] = styles.getPropertyValue(name).trim();
    }
  }

  return tokens;
}

/**
 * Theme utilities object for convenient access
 */
export const theme = {
  getColor,
  getSemanticColor,
  getOpacity,
  getBorderRadius,
  cssVar,
  rgba,
  getAllTokens: getAllThemeTokens,
} as const;
