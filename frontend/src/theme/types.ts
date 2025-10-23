/**
 * TypeScript types for Allegro Design System theme tokens
 */

export type ThemeMode = "light" | "dark";

/**
 * Color palette scale from 50 to 900
 */
export type ColorScale =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

/**
 * Color palettes available in the design system
 */
export type ColorPalette =
  | "blue"
  | "gray"
  | "green"
  | "haze"
  | "navy"
  | "orange"
  | "red"
  | "teal"
  | "yellow";

/**
 * Opacity values
 */
export type Opacity =
  | "0"
  | "8"
  | "12"
  | "16"
  | "26"
  | "32"
  | "38"
  | "42"
  | "54"
  | "60"
  | "70"
  | "80"
  | "87"
  | "90"
  | "100";

/**
 * Semantic opacity tokens
 */
export type SemanticOpacity =
  | "primary"
  | "secondary"
  | "tertiary"
  | "tertiary-inverted"
  | "state-disabled"
  | "state-disabled-inverted"
  | "state-hidden"
  | "state-hover"
  | "state-pressed"
  | "state-pressed-variant";

/**
 * Border radius sizes
 */
export type BorderRadiusSize =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "12";

/**
 * Semantic border radius tokens
 */
export type SemanticBorderRadius =
  | "none"
  | "xs"
  | "s"
  | "m"
  | "l"
  | "action"
  | "chat"
  | "container"
  | "form"
  | "indicator"
  | "messaging"
  | "modal"
  | "navigation"
  | "progress"
  | "tag"
  | "tile";

/**
 * Semantic color categories
 */
export type SemanticColor =
  | "border"
  | "border-elevation"
  | "border-dark"
  | "border-hover"
  | "text"
  | "text-secondary"
  | "text-inverted"
  | "card"
  | "desk"
  | "bg-elevation"
  | "bg-secondary"
  | "bg-carousel-surface"
  | "link"
  | "link-visited"
  | "link-visited-active"
  | "link-hover"
  | "link-active"
  | "link-inverted-active"
  | "button-secondary"
  | "button-secondary-hover"
  | "disabled-light"
  | "disabled"
  | "warning"
  | "error"
  | "info"
  | "success"
  | "message"
  | "message-border"
  | "message-tip"
  | "message-light"
  | "message-shadow"
  | "primary"
  | "secondary"
  | "active"
  | "semitransparent"
  | "semitransparent-dark"
  | "highlight"
  | "shadow"
  | "shadow-elevation"
  | "overlay"
  | "bar"
  | "price"
  | "price-bargain";

/**
 * Status colors
 */
export type StatusColor = "error" | "warning" | "success" | "info";

/**
 * Accent colors
 */
export type AccentColor = "primary" | "secondary" | "tertiary";

/**
 * State colors
 */
export type StateColor =
  | "primary-enabled"
  | "primary-hover"
  | "primary-focus"
  | "secondary-enabled"
  | "secondary-hover"
  | "secondary-focus"
  | "secondary-pressed"
  | "secondary-visited"
  | "disabled"
  | "selected";

/**
 * Theme token structure
 */
export interface ThemeTokens {
  colors: {
    palette: Record<ColorPalette, Record<ColorScale, string>>;
    semantic: Record<SemanticColor, string>;
    status: Record<StatusColor, string>;
    accent: Record<AccentColor, string>;
    state: Record<StateColor, string>;
  };
  opacity: {
    values: Record<Opacity, number>;
    semantic: Record<SemanticOpacity, number>;
  };
  borderRadius: {
    sizes: Record<BorderRadiusSize, string>;
    semantic: Record<SemanticBorderRadius, string>;
  };
}

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: ThemeMode;
  tokens: ThemeTokens;
}
