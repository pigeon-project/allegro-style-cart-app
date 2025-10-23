# Allegro Design System - Tailwind Integration

This document explains how the Allegro design system theme tokens are integrated with Tailwind CSS v4.

## Configuration

The theme is configured in `src/index.css` using Tailwind v4's `@theme` directive. All Allegro design tokens are mapped to Tailwind's color and spacing system.

## Available Tailwind Classes

### Semantic Colors

Use these for common UI elements:

```tsx
// Backgrounds
<div className="bg-primary">       // Allegro orange (#ff5a00)
<div className="bg-secondary">     // Teal accent
<div className="bg-background">    // Page background (adapts to theme)
<div className="bg-surface">       // Card/surface background (adapts to theme)

// Text
<p className="text-text">           // Primary text color (adapts to theme)
<p className="text-text-secondary"> // Secondary text color (adapts to theme)

// Borders
<div className="border-border">    // Border color (adapts to theme)

// Status colors
<div className="bg-success">       // Green for success
<div className="bg-warning">       // Yellow for warnings
<div className="bg-error">         // Red for errors
<div className="bg-info">          // Blue for info
```

### Color Palettes

All Allegro color palettes are available with their full scale:

```tsx
// Orange (Primary brand color)
<div className="bg-orange-500">    // #ff5a00
<div className="bg-orange-600">    // Darker shade
<div className="text-orange-300">  // Lighter shade

// Teal (Secondary)
<div className="bg-teal-600">
<div className="text-teal-500">

// Other palettes: blue, green, red, yellow, gray, haze, navy
<div className="bg-navy-800">      // Dark background
<div className="bg-haze-100">      // Light background
```

### Border Radius

```tsx
<div className="rounded-xs">       // var(--m-border-radius-xs)
<div className="rounded-sm">       // var(--m-border-radius-s)
<div className="rounded-md">       // var(--m-border-radius-m)
<div className="rounded-lg">       // var(--m-border-radius-l)
<div className="rounded-xl">       // 8px
<div className="rounded-2xl">      // 12px
```

## Example Usage

### Button Component

```tsx
<button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">
  Click me
</button>
```

### Card Component

```tsx
<div className="bg-surface border border-border rounded-lg p-6">
  <h2 className="text-text text-xl font-bold">Card Title</h2>
  <p className="text-text-secondary mt-2">Card content goes here</p>
</div>
```

### Status Badge

```tsx
<span className="bg-success text-white px-3 py-1 rounded-full text-sm">
  Success
</span>
```

### Form Input

```tsx
<input
  type="text"
  className="bg-surface border border-border rounded-md px-3 py-2 text-text focus:border-primary"
/>
```

## Dark Mode Support

All semantic colors (background, surface, text, border) automatically adapt to dark mode when the `.dark` class is applied to the document root. You don't need to do anything special in your components - just use the semantic color classes.

```tsx
// This component works in both light and dark mode automatically
function MyComponent() {
  return (
    <div className="bg-surface text-text border border-border">
      Content adapts to theme automatically
    </div>
  );
}
```

## Mixing with CSS Variables

You can still use CSS variables directly when needed:

```tsx
<div style={{ backgroundColor: "var(--m-color-primary)" }}>
  Using CSS variable directly
</div>
```

But Tailwind classes are preferred for better consistency and maintainability:

```tsx
<div className="bg-primary">Using Tailwind class (preferred)</div>
```

## Custom Utilities

If you need additional Tailwind utilities not covered by the theme, you can extend the configuration by adding more `@theme` rules in `index.css`.
