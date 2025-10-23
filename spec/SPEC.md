# Allegro-Style Cart Application Specification

## 1. Overview

A web application that replicates the cart currently found at `https://allegro.pl/koszyk`. The UI
supports adding items to the cart, editing quantities, removing items, 
an **empty state**, and a **recommended products carousel** enabling
one‑click add‑to‑cart. 

## 2. Target Users

* **Primary**: Shoppers adding and reviewing items prior to checkout.

## 3. Key Features

1. **cart page (full view)**
    * Seller sections (“Parcel from...”), line items with thumbnail, title, attributes, unit price, quantity stepper,
      line total, remove icon.
    * Collapsible seller group and master “entire cart” checkbox UI.
    * **order summary panel** with subtotal, savings, delivery (static or computed), grand total, CTA
      buttons (**Delivery and Payment**, **Continue Shopping**), and coupon hint area.
    * Informational boxes (e.g., Buyer Protection) as in mockups.
2. **Empty state** identical to Allegro’s (illustration area, copy, suggested products row).
3. **Recommended products carousel** (“Add it to your shipment!”) with horizontal scroll, price cards, and **To cart**
   buttons; adds directly to cart.
4. **Interactions**
    * Quantity increment/decrement with min/max and validation; immediate totals update.
    * Remove line item.
    * Add from recommendations.
5. **Localization**: Polish copy by default, messages stored in .po files
6. **Accessibility**: Keyboard and screen‑reader friendly. Focus rings and aria labels on controls.

## 4. Functional Requirements

### 4.1 UI/UX

### Theme

Theme tokens to be used.
`--m-color-orange-500` is Allegro primary color.

```css
  -m-color-filter-orange: brightness(0) saturate(100%) invert(37%) sepia(82%) saturate(2285%) hue-rotate(1deg) brightness(103%) contrast(106%);
  --m-color-filter-white: brightness(0) invert();
  --m-color-filter-teal: brightness(0) saturate(100%) invert(41%) sepia(56%) saturate(2644%) hue-rotate(145deg) brightness(96%) contrast(101%);
  --m-color-filter-teal-200: brightness(0) saturate(100%) invert(89%) sepia(12%) saturate(1334%) hue-rotate(107deg) brightness(98%) contrast(76%);
  --m-color-filter-teal-300: brightness(0) saturate(100%) invert(70%) sepia(26%) saturate(717%) hue-rotate(120deg) brightness(94%) contrast(94%);
  --m-color-filter-teal-400: brightness(0) saturate(100%) invert(66%) sepia(17%) saturate(1639%) hue-rotate(121deg) brightness(90%) contrast(85%);
  --m-color-filter-teal-600: brightness(0) saturate(100%) invert(34%) sepia(70%) saturate(5757%) hue-rotate(159deg) brightness(91%) contrast(107%);
  --m-color-filter-black: brightness(0) saturate(100%);
  --m-color-filter-gray: brightness(0) saturate(100%) invert(44%) sepia(15%) saturate(0%) hue-rotate(215deg) brightness(100%) contrast(86%);
  --m-color-filter-silver: brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(2075%) hue-rotate(307deg) brightness(105%) contrast(73%);
  --m-color-filter-green: brightness(0) saturate(100%)invert(49%) sepia(79%) saturate(650%) hue-rotate(78deg) brightness(96%) contrast(94%);
  --m-color-filter-red: brightness(0) saturate(100%) invert(20%) sepia(76%) saturate(2471%) hue-rotate(344deg) brightness(106%) contrast(110%);
  --m-color-filter-disabled: brightness(0) saturate(100%) invert(98%) sepia(0%) saturate(0%) hue-rotate(190deg) brightness(84%) contrast(83%);
  --m-color-filter-blue: brightness(0) saturate(100%) invert(56%) sepia(9%) saturate(2872%) hue-rotate(159deg) brightness(94%) contrast(86%);
  --m-color-link-filter: var(--m-color-filter-teal-600);
  --m-color-link-filter-hover: var(--m-color-filter-teal-400);
  --m-color-link-filter-icon: var(--m-color-filter-gray);
  --m-color-icon-filter: unset;
  --m-color-placeholder-filter: unset;
  --m-color-icon-filter-disabled: var(--m-color-filter-disabled);
  --m-color-blue: var(--m-color-blue-500);
  --m-color-gray: var(--m-color-gray-500);
  --m-color-green: var(--m-color-green-500);
  --m-color-haze: var(--m-color-haze-500);
  --m-color-navy: var(--m-color-navy-500);
  --m-color-orange: var(--m-color-orange-500);
  --m-color-red: var(--m-color-red-500);
  --m-color-silver: var(--m-color-gray-100);
  --m-color-teal: var(--m-color-teal-500);
  --m-color-transparent: rgba(var(--m-color-white-rgb),var(--m-opacity-state-hidden));
  --m-color-white-80p: rgba(var(--m-color-white-rgb),0.8);
  --m-color-yellow: var(--m-color-yellow-500);
  --m-color-black: #000;
  --m-color-blue-50: #e1eff9;
  --m-color-blue-100: #c4def4;
  --m-color-blue-200: #a3cbe8;
  --m-color-blue-300: #83b9dd;
  --m-color-blue-400: #62a6d1;
  --m-color-blue-500: #4294c6;
  --m-color-blue-600: #35769e;
  --m-color-blue-700: #285977;
  --m-color-blue-800: #1a3b4f;
  --m-color-blue-900: #0d1e28;
  --m-color-gray-100: #ddd;
  --m-color-gray-200: #c3c3c3;
  --m-color-gray-300: #aaa;
  --m-color-gray-400: #909090;
  --m-color-gray-500: #767676;
  --m-color-gray-600: #656565;
  --m-color-gray-700: #545454;
  --m-color-gray-800: #444;
  --m-color-gray-900: #222;
  --m-color-green-50: #dcf8d9;
  --m-color-green-100: #b9f1b4;
  --m-color-green-200: #92e390;
  --m-color-green-300: #6ad46d;
  --m-color-green-400: #43c649;
  --m-color-green-500: #1bb826;
  --m-color-green-600: #169a23;
  --m-color-green-700: #107b1e;
  --m-color-green-800: #0b5d1a;
  --m-color-green-900: #053e15;
  --m-color-haze-50: #f6f7f8;
  --m-color-haze-100: #eceff1;
  --m-color-haze-200: #d9dfe4;
  --m-color-haze-300: #c6d0d6;
  --m-color-haze-400: #b3c0c9;
  --m-color-haze-500: #a0b0bb;
  --m-color-haze-600: #92a2ad;
  --m-color-haze-700: #84949f;
  --m-color-haze-800: #768592;
  --m-color-haze-900: #687784;
  --m-color-navy-100: #d8dcde;
  --m-color-navy-200: #b0b8bc;
  --m-color-navy-300: #89959b;
  --m-color-navy-400: #617179;
  --m-color-navy-500: #3a4e58;
  --m-color-navy-600: #2e3e46;
  --m-color-navy-700: #232f35;
  --m-color-navy-800: #171f23;
  --m-color-navy-900: #0c1012;
  --m-color-orange-100: #ffdecc;
  --m-color-orange-200: #ffbd99;
  --m-color-orange-300: #ff9c66;
  --m-color-orange-400: #ff7b33;
  --m-color-orange-500: #ff5a00;
  --m-color-orange-600: #d94b00;
  --m-color-orange-700: #b33c00;
  --m-color-orange-800: #8c2e00;
  --m-color-orange-900: #661f00;
  --m-color-red-100: #f9c6c0;
  --m-color-red-200: #f39d97;
  --m-color-red-300: #ec736d;
  --m-color-red-400: #e64a44;
  --m-color-red-500: #e0211b;
  --m-color-red-600: #c01a16;
  --m-color-red-700: #a01410;
  --m-color-red-800: #800d0b;
  --m-color-red-900: #600705;
  --m-color-teal-100: #a9eddd;
  --m-color-teal-200: #7fdcca;
  --m-color-teal-300: #54cab6;
  --m-color-teal-400: #2ab9a3;
  --m-color-teal-500: #00a790;
  --m-color-teal-600: #008673;
  --m-color-teal-700: #006456;
  --m-color-teal-800: #00433a;
  --m-color-teal-900: #00211d;
  --m-color-white: #fff;
  --m-color-yellow-100: #fef3c4;
  --m-color-yellow-200: #fde798;
  --m-color-yellow-300: #fcdb6c;
  --m-color-yellow-400: #fbcf40;
  --m-color-yellow-500: #fac314;
  --m-color-yellow-600: #d89c10;
  --m-color-yellow-700: #b6750c;
  --m-color-yellow-800: #944e08;
  --m-color-yellow-900: #722704;
  --m-color-black-rgb: 0,0,0;
  --m-color-blue-600-rgb: 53,118,158;
  --m-color-gray-100-rgb: 221,221,221;
  --m-color-gray-600-rgb: 101,101,101;
  --m-color-gray-700-rgb: 84,84,84;
  --m-color-gray-900-rgb: 34,34,34;
  --m-color-green-600-rgb: 22,154,35;
  --m-color-haze-600-rgb: 146,162,173;
  --m-color-navy-500-rgb: 58,78,88;
  --m-color-navy-600-rgb: 46,62,70;
  --m-color-orange-500-rgb: 255,90,0;
  --m-color-orange-600-rgb: 217,75,0;
  --m-color-red-600-rgb: 192,26,22;
  --m-color-teal-400-rgb: 42,185,163;
  --m-color-teal-600-rgb: 0,134,115;
  --m-color-teal-800-rgb: 0,67,58;
  --m-color-white-rgb: 255,255,255;
  --m-color-yellow-600-rgb: 216,156,16;
  --m-color-smart-rgb: 66,39,121;
  --m-color-pay-rgb: 14,92,170;
  --m-color-one-rgb: 2,109,87;
  --m-color-lokalnie-rgb: 98,86,177;
  --m-color-protect-rgb: 20,133,158;
  --m-color-business-rgb: 5,23,116;
  --m-color-charity-rgb: 224,33,27;
  --m-color-foundation-rgb: 62,96,114;
  --m-color-family-rgb: 214,0,126;
  --m-color-delivery-rgb: 0,109,87;
  --m-color-cash-rgb: 233,64,123;
  --m-color-sales-center-rgb: 45,76,114;
  --m-opacity-primary: var(--m-opacity-87);
  --m-opacity-secondary: var(--m-opacity-54);
  --m-opacity-state-disabled-inverted: var(--m-opacity-42);
  --m-opacity-state-disabled: var(--m-opacity-26);
  --m-opacity-state-hidden: var(--m-opacity-0);
  --m-opacity-state-hover: var(--m-opacity-80);
  --m-opacity-state-pressed-variant: var(--m-opacity-32);
  --m-opacity-state-pressed: var(--m-opacity-12);
  --m-opacity-tertiary-inverted: var(--m-opacity-54);
  --m-opacity-tertiary: var(--m-opacity-12);
  --m-opacity-0: 0;
  --m-opacity-8: 0.08;
  --m-opacity-12: 0.12;
  --m-opacity-16: 0.16;
  --m-opacity-26: 0.26;
  --m-opacity-32: 0.32;
  --m-opacity-38: 0.38;
  --m-opacity-42: 0.42;
  --m-opacity-54: 0.54;
  --m-opacity-60: 0.6;
  --m-opacity-70: 0.7;
  --m-opacity-80: 0.8;
  --m-opacity-87: 0.87;
  --m-opacity-90: 0.9;
  --m-opacity-100: 1;
  --m-border-radius-0: 0;
  --m-border-radius-1: calc((var(--m-border-radius-p-base) + (1 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-2: calc((var(--m-border-radius-p-base) + (2 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-3: calc((var(--m-border-radius-p-base) + (3 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-4: calc((var(--m-border-radius-p-base) + (4 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-5: calc((var(--m-border-radius-p-base) + (5 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-6: calc((var(--m-border-radius-p-base) + (6 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-7: calc((var(--m-border-radius-p-base) + (7 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-8: calc((var(--m-border-radius-p-base) + (8 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-12: calc((var(--m-border-radius-p-base) + (12 - 1)*var(--m-border-radius-p-difference))*var(--m-border-radius-p-ratio));
  --m-border-radius-p-base: 2px;
  --m-border-radius-p-difference: 2px;
  --m-border-radius-p-ratio: 1;
  --m-border-radius-action: var(--m-border-radius-xs);
  --m-border-radius-chat: var(--m-border-radius-m);
  --m-border-radius-container: var(--m-border-radius-none);
  --m-border-radius-form: var(--m-border-radius-xs);
  --m-border-radius-indicator: var(--m-border-radius-xs);
  --m-border-radius-l: var(--m-border-radius-8);
  --m-border-radius-m: var(--m-border-radius-4);
  --m-border-radius-messaging: var(--m-border-radius-xs);
  --m-border-radius-modal: var(--m-border-radius-none);
  --m-border-radius-navigation: var(--m-border-radius-none);
  --m-border-radius-none: var(--m-border-radius-0);
  --m-border-radius-progress: var(--m-border-radius-none);
  --m-border-radius-s: var(--m-border-radius-2);
  --m-border-radius-tag: var(--m-border-radius-xs);
  --m-border-radius-tile: var(--m-border-radius-m);
  --m-border-radius-xs: var(--m-border-radius-1);
  --m-color-border: var(--m-color-neutral-border);
  --m-color-border-elevation: var(--m-color-neutral-border-muted);
  --m-color-text: var(--m-color-neutral-on-surface-primary);
  --m-color-text-secondary: var(--m-color-neutral-on-surface-secondary);
  --m-color-text-inverted: var(--m-color-neutral-on-surface-inverted);
  --m-color-card: var(--m-color-neutral-surface);
  --m-color-desk: var(--m-color-neutral-background);
  --m-color-link: var(--m-color-state-secondary-enabled);
  --m-color-link-visited: var(--m-color-state-secondary-visited);
  --m-color-link-visited-active: var(--m-color-state-secondary-visited-pressed);
  --m-color-link-hover: var(--m-color-state-secondary-hover);
  --m-color-link-active: var(--m-color-state-secondary-pressed);
  --m-color-link-inverted-active: var(--m-color-state-secondary-inverted-pressed);
  --m-color-button-secondary: var(--m-color-state-secondary-enabled);
  --m-color-button-secondary-hover: var(--m-color-state-secondary-hover);
  --m-color-disabled-light: var(--m-color-state-overlay-disabled);
  --m-color-disabled: var(--m-color-state-disabled);
  --m-color-warning: var(--m-color-status-warning);
  --m-color-error: var(--m-color-status-error);
  --m-color-info: var(--m-color-status-info);
  --m-color-success: var(--m-color-status-success);
  --m-color-message: var(--m-color-status-warning);
  --m-color-message-border: var(--m-color-neutral-border-muted);
  --m-color-primary: var(--m-color-accent-primary);
  --m-color-secondary: var(--m-color-accent-secondary);
  --m-color-bubble-admin: var(--m-color-white);
  --m-color-bubble-dark: var(--m-color-blue-800);
  --m-color-bubble-light: var(--m-color-haze-100);
  --m-color-bubble-light-border: var(--m-color-haze-300);
  --m-color-bubble-pending: var(--m-color-blue-200);
  --m-color-bubble-pending-color: var(--m-color-white);
  --m-color-table-zebra: var(--m-color-haze-50);
  --m-color-price: var(--m-color-navy-500);
  --m-color-price-bargain: var(--m-color-green-700);
  --m-color-progress: var(--m-color-silver);
  --m-color-bg-secondary: var(--m-color-gray-500);
  --m-color-active: var(--m-color-white);
  --m-color-semitransparent: var(--m-color-white-80p);
  --m-color-semitransparent-dark: var(--m-color-white-80p);
  --m-color-highlight: rgba(var(--m-color-gray-100-rgb),0.6);
  --m-color-shadow-elevation: rgba(var(--m-color-black-rgb),.32);
  --m-color-message-shadow: rgba(var(--m-color-black-rgb),var(--m-opacity-tertiary));
  --m-color-shadow: rgba(var(--m-color-navy-500-rgb),.36);
  --m-color-overlay: rgba(var(--m-color-gray-700-rgb),.5);
  --m-color-bg-elevation: var(--m-color-white);
  --m-color-delivery-prediction-fast: var(--m-color-green-700);
  --m-color-delivery-prediction-long: var(--m-color-yellow-800);
  --m-color-delivery-prediction-xmas: var(--m-color-red-700);
  --m-color-bg-carousel-surface: var(--m-color-blue-50);
  --m-color-border-dark: var(--m-color-border);
  --m-color-border-hover: var(--m-color-border);
  --m-color-bar: var(--m-color-navy-500);
  --m-color-message-tip: var(--m-color-navy-700);
  --m-color-message-light: var(--m-color-white);
  --m-color-accent-on-primary-inverted-variant-rgb: var(--m-color-accent-primary-rgb);
  --m-color-accent-on-primary-inverted-variant: var(--m-color-accent-primary);
  --m-color-accent-on-primary-rgb: var(--m-color-white-rgb);
  --m-color-accent-on-primary: var(--m-color-white);
  --m-color-accent-primary-inverted-variant-rgb: var(--m-color-white-rgb);
  --m-color-accent-primary-inverted-variant: var(--m-color-white);
  --m-color-accent-primary-inverted: var(--m-color-orange-300);
  --m-color-accent-primary-rgb: var(--m-color-orange-500-rgb);
  --m-color-accent-primary: var(--m-color-orange-500);
  --m-color-accent-secondary-inverted-variant-rgb: var(--m-color-white-rgb);
  --m-color-accent-secondary-inverted-variant: var(--m-color-white);
  --m-color-accent-secondary-inverted: var(--m-color-teal-400);
  --m-color-accent-secondary-rgb: var(--m-color-teal-600-rgb);
  --m-color-accent-secondary: var(--m-color-teal-600);
  --m-color-accent-tertiary: var(--m-color-blue-600);
  --m-color-decoration-primary: var(--m-color-orange-400);
  --m-color-decoration-secondary: var(--m-color-navy-200);
  --m-color-decoration-tertiary: var(--m-color-haze-200);
  --m-color-neutral-background: var(--m-color-haze-100);
  --m-color-neutral-border-muted: var(--m-color-neutral-surface-muted);
  --m-color-neutral-border: var(--m-color-neutral-on-surface-secondary);
  --m-color-neutral-on-surface-inverted-rgb: var(--m-color-white-rgb);
  --m-color-neutral-on-surface-inverted: var(--m-color-white);
  --m-color-neutral-on-surface-primary-inverted: rgba(var(--m-color-white-rgb),var(--m-opacity-87));
  --m-color-neutral-on-surface-primary: rgba(var(--m-color-neutral-on-surface-rgb),var(--m-opacity-primary));
  --m-color-neutral-on-surface-rgb: var(--m-color-black-rgb);
  --m-color-neutral-on-surface-secondary: rgba(var(--m-color-neutral-on-surface-rgb),var(--m-opacity-secondary));
  --m-color-neutral-on-surface: var(--m-color-black);
  --m-color-neutral-surface-dark: rgba(var(--m-color-black-rgb),var(--m-opacity-54));
  --m-color-neutral-surface-inverted: var(--m-color-navy-500);
  --m-color-neutral-surface-light: rgba(var(--m-color-white-rgb),var(--m-opacity-80));
  --m-color-neutral-surface-muted-inverted: rgba(var(--m-color-white-rgb),var(--m-opacity-tertiary-inverted));
  --m-color-neutral-surface-muted: rgba(var(--m-color-neutral-on-surface-rgb),var(--m-opacity-tertiary));
  --m-color-neutral-surface-rgb: var(--m-color-white-rgb);
  --m-color-neutral-surface-variant: rgba(var(--m-color-neutral-surface-rgb),var(--m-opacity-state-hidden));
  --m-color-neutral-surface: var(--m-color-white);
  --m-color-state-disabled-inverted: rgba(var(--m-color-neutral-on-surface-inverted-rgb),var(--m-opacity-state-disabled-inverted));
  --m-color-state-disabled: rgba(var(--m-color-neutral-on-surface-rgb),var(--m-opacity-state-disabled));
  --m-color-state-on-surface-secondary-enabled: var(--m-color-neutral-on-surface-secondary);
  --m-color-state-on-surface-secondary-focus: var(--m-color-state-on-surface-secondary-hover);
  --m-color-state-on-surface-secondary-hover: rgba(0,0,0,.432);
  --m-color-state-overlay-disabled-inverted: rgba(var(--m-color-neutral-on-surface-inverted-rgb),var(--m-opacity-tertiary));
  --m-color-state-overlay-disabled: rgba(var(--m-color-neutral-on-surface-rgb),var(--m-opacity-tertiary));
  --m-color-state-overlay-on-primary-inverted-variant-pressed: rgba(var(--m-color-accent-on-primary-inverted-variant-rgb),var(--m-opacity-state-pressed));
  --m-color-state-overlay-on-primary-pressed: rgba(var(--m-color-accent-on-primary-rgb),var(--m-opacity-state-pressed-variant));
  --m-color-state-overlay-on-surface-secondary-pressed: rgba(var(--m-color-neutral-on-surface-rgb),var(--m-opacity-state-pressed));
  --m-color-state-overlay-secondary-inverted-variant-pressed: rgba(var(--m-color-accent-secondary-inverted-variant-rgb),var(--m-opacity-state-pressed));
  --m-color-state-overlay-secondary-pressed: rgba(var(--m-color-accent-secondary-rgb),var(--m-opacity-state-pressed));
  --m-color-state-primary-enabled: var(--m-color-accent-primary);
  --m-color-state-primary-focus: var(--m-color-state-primary-hover);
  --m-color-state-primary-hover: rgba(var(--m-color-accent-primary-rgb),var(--m-opacity-state-hover));
  --m-color-state-primary-inverted-variant-enabled: var(--m-color-accent-primary-inverted-variant);
  --m-color-state-primary-inverted-variant-focus: var(--m-color-state-primary-inverted-variant-hover);
  --m-color-state-primary-inverted-variant-hover: rgba(var(--m-color-accent-primary-inverted-variant-rgb),var(--m-opacity-state-hover));
  --m-color-state-secondary-enabled: var(--m-color-accent-secondary);
  --m-color-state-secondary-focus: #15423a;
  --m-color-state-secondary-hover: #136355;
  --m-color-state-secondary-inverted-enabled: var(--m-color-accent-secondary-inverted);
  --m-color-state-secondary-inverted-focus: var(--m-color-state-secondary-inverted-hover);
  --m-color-state-secondary-inverted-hover: #55c7b5;
  --m-color-state-secondary-inverted-pressed: #7fd5c8;
  --m-color-state-secondary-inverted-variant-enabled: var(--m-color-accent-secondary-inverted-variant);
  --m-color-state-secondary-inverted-variant-hover: rgba(var(--m-color-accent-secondary-inverted-variant-rgb),var(--m-opacity-state-hover));
  --m-color-state-secondary-inverted-variant-pressed: rgba(var(--m-color-accent-secondary-inverted-variant-rgb),var(--m-opacity-state-pressed));
  --m-color-state-secondary-pressed: #15423a;
  --m-color-state-secondary-variant-enabled: var(--m-color-neutral-on-surface-primary);
  --m-color-state-secondary-visited-hover: var(--m-color-state-secondary-hover);
  --m-color-state-secondary-visited-pressed: var(--m-color-state-secondary-pressed);
  --m-color-state-secondary-visited: var(--m-color-accent-tertiary);
  --m-color-state-selected-inverted: var(--m-color-accent-primary-inverted);
  --m-color-state-selected: #ff5a00;
  --m-color-status-error: var(--m-color-red-500);
  --m-color-status-info: var(--m-color-blue-500);
  --m-color-status-success: var(--m-color-green-600);
  --m-color-status-warning: var(--m-color-yellow-500)
}
```

* **Pixel accuracy**: Implement a theme using design tokens;
* **Recommendations carousel**: Lazy loads 8–24 items; keyboard scroll; snap alignment; per‑card **To cart**
  control.
* **Empty state**: When cart empty, show hero illustration + suggestions strip; hide summary panel.
* **Error banners**: Non‑blocking inline error rows for transient errors (e.g., price changed on refresh).

### 4.2 cart domain

* ** Item model**:
  `{ itemId, productId, title, sellerId, sellerName, imageUrl, attributes[], quantity, minQty=1, maxQty=99, step=1, price, listPrice, currency="PLN", availability: { inStock, maxOrderable }, shippingGroupId }`.
* ** Grouping**: UI groups items by `sellerId` with a header matching the “Parcel from {seller}” block.
* ** Calculations**:
    * LineTotal = `quantity × price`.
    * SavingsPerLine = `quantity × (listPrice − price)` (min 0).
    * Subtotal = sum(LineTotal).
    * SavingsTotal = sum(SavingsPerLine).
    * Delivery = from API `shippingQuote` or **0** if not provided (configurable).
    * GrandTotal = `Subtotal + Delivery`.
* ** Validation**: Quantity changes clipped to `[minQty, min(maxQty, availability.maxOrderable)]`.

### 4.3 Recommendations

* ** Mock some recommended offers
* ** Add from carousel**: Clicking **To cart** adds with default quantity (respecting min/step) and triggers recalculation.

### 4.4 State & Error Handling

* Network errors show inline retry with backoff.
* Price/stock drift: if API returns different `price` or `availability`, highlight the line and update
  totals.
* Remove item confirmation optionally enabled via config.

## 5. Non‑Functional Requirements

This service **inherits all organization‑wide NFRs** from [`SHARED-NFR.md`](./SHARED-NFR.md). Service‑specific
tightenings:

* **Performance**: p95 latency targets tightened to **≤150 ms** for read/quote endpoints; p95 write (mutations) **≤250
  ms**.
* **Availability**: UI must remain usable offline for previously loaded assets; cart persistence remains local.
* **Security/Privacy**: No PII stored; product interactions anonymized. All endpoints HTTPS; tokens validated; rate
  limits enforced.
* **Observability**: Frontend logs include correlation id and anonymized cart metrics; backend exposes per‑endpoint
  p50/p90/p95/p99.
* **Accessibility**: WCAG 2.2 AA compliance for controls used on the cart page.

## 6. Mockups

`./mockups` folder contains screenshot of the app in light/dark mode and desktop/mobile viewports.

## 7. API Specification

Base path: `/api`. 
All responses use `application/json`.

### 7.2 Models

```ts
interface Product {
    id: string,
    sellerId: string,
    sellerName: string,
    title: string,
    imageUrl: string,
    attributes? : { name: string, value: string }[],
    price: Money,          // effective price used for totals
    listPrice? : Money,     // when present and > price, shows savings
    currency: 'PLN',
    availability: { inStock: boolean, maxOrderable: number},
    minQty? : number,
    maxQty? : number,
}

interface Money {
    amount: number, //value in grosze
    currency: 'PLN'
}

interface CartItem {
    itemId: string,            // uuid
    productId: string,
    quantity: number,
    price: Money,
    listPrice? : Money,
}

interface CartSnapshot {
  cartId: string,            // uuid (backend‑generated)
  items: CartItem[],
  computed: {
    subtotal: Money,
    delivery: Money,
    total: Money
  }
}

interface QuoteRequest{
    cartId: string,
    items: { productId: string, quantity: number }[]
}

interface QuoteResponse extends CartSnapshot //with server‑ validated prices & availability
```

### 7.3 Endpoints

**Products**

* `GET /api/products/{id}` → `Product`
* `GET /api/products?ids=…` → `Product[]`
* `GET /api/products/recommended` → `Product[]` (returns 12 recommended products for carousel)

**Cart (stateless pricing & validation)**

* `POST /api/carts/{cartId}/items` body: `{ productId, quantity }` → `QuoteResponse`
* `PATCH /api/carts/{cartId}/items/{itemId}` body: `{ quantity }` → `QuoteResponse`
* `DELETE /api/carts/{cartId}/items/{itemId}` → `QuoteResponse`
* `POST /api/carts/{cartId}/quote` body: `QuoteRequest` → `QuoteResponse`

**Errors**
Use Spring Boot `Problem` api.
HTTP semantics: 400/401/403/404/409/412/422/429/5xx per shared NFR.

## 8. Data & Business Rules

* Currency: **PLN**, precision **2**; rounding **banker’s rounding**.
* Delivery defaults to **0** unless `shippingQuote` provided; can be toggled via config.
* Max quantity per item default **99** unless restricted by availability.
* Promotions: **omitted** (no bulk or fifth‑item rules).

## 9. Frontend Architecture

* **Performance**: Debounced API quote on mutations (e.g., 200–400 ms) with optimistic ui updates.
* **Routing**: Single page: `/`.
* **Testing**: Unit (calculations), integration (quantity/remove/add flows)
* **E2e tests* using playwright

### 9.1 Routing Implementation

The application uses TanStack Router (v1) with file-based routing for a type-safe and performant routing solution.

**Router Configuration** (`/frontend/src/main.tsx`):
- TanStack Router configured with auto-generated route tree
- Router instance created and registered for TypeScript type safety
- Wrapped with QueryClient and ThemeProvider for global state management

**Router Plugin** (`/frontend/vite.config.ts`):
- `@tanstack/router-plugin` Vite plugin added for file-based routing
- Auto-generates `routeTree.gen.ts` from route files
- Hot module replacement (HMR) support for route changes

**Route Structure** (`/frontend/src/routes/`):
- `__root.tsx` - Root layout component with header, logo, and theme toggle
- `index.tsx` - Cart page component at `/` route
- File-based routing pattern for scalability

**Root Layout** (`/frontend/src/routes/__root.tsx`):
- Header with Allegro logo and branding
- Theme toggle button (light/dark mode)
- Sticky header with border and proper z-index
- Responsive design with Tailwind utilities
- `<Outlet />` for nested route rendering

**Cart Page** (`/frontend/src/routes/index.tsx`):
- Root route `/` displays the cart page
- Responsive grid layout: 2/3 cart content, 1/3 order summary on desktop
- Stacked layout on mobile (order summary below cart)
- Sticky order summary panel on desktop
- Placeholder content for cart items (to be implemented)
- Order summary with subtotal, delivery, and total
- Primary action buttons (Delivery and Payment, Continue Shopping)
- Coupon hint area

**Responsive Breakpoints**:
- Mobile: Single column, stacked layout
- Desktop (lg): Two-column grid (2:1 ratio)
- Order summary sticky on desktop, flows naturally on mobile

**Type Safety**:
- Auto-generated route tree provides full TypeScript type safety
- Route params, search params, and loaders are fully typed
- TypeScript module augmentation for router registration

**Testing**:
- Basic smoke tests for route rendering
- Tests verify router doesn't crash and renders components
- 38 total tests passing (2 new routing tests added)

**Dependencies Added**:
- `@tanstack/react-router` - Router library
- `@tanstack/router-plugin` - Vite plugin for file-based routing

### 9.2 Theme System Implementation

The Allegro Design System theme has been fully implemented in the frontend with the following components:

**Theme Tokens** (`/frontend/src/theme/tokens.css`):
- All CSS custom properties from the specification implemented as CSS variables
- Complete color palette with 9 scales for each color (blue, gray, green, haze, navy, orange, red, teal, yellow)
- RGB variants for all key colors to enable rgba() combinations
- Opacity tokens (0-100) with semantic aliases (primary, secondary, tertiary, etc.)
- Border radius tokens with calculated values and semantic mappings
- Comprehensive semantic color mappings for UI elements (text, borders, backgrounds, links, buttons, etc.)
- Full dark mode support with automatic color overrides

**Theme Provider** (`/frontend/src/theme/ThemeProvider.tsx`):
- React context-based theme management
- Supports both light and dark modes
- Persists theme preference in localStorage
- Automatically detects system color scheme preference
- Applies `.dark` class to document root for dark mode
- Listens for system theme changes and updates accordingly

**Theme Hook** (`/frontend/src/theme/useTheme.ts`):
- `useTheme()` hook for accessing theme context in components
- Provides `mode`, `setMode()`, and `toggleMode()` functions
- Throws helpful error if used outside ThemeProvider

**Theme Utilities** (`/frontend/src/theme/utils.ts`):
- `getColor()` - Get palette colors by name and scale
- `getSemanticColor()` - Get semantic colors (text, border, etc.)
- `getOpacity()` - Get opacity values
- `getBorderRadius()` - Get border radius values
- `cssVar()` - Create CSS variable references
- `rgba()` - Create rgba colors from RGB tokens
- `getAllTokens()` - Get all current theme token values

**TypeScript Types** (`/frontend/src/theme/types.ts`):
- Complete type definitions for all theme tokens
- ThemeMode type ("light" | "dark")
- Color palette, opacity, border radius types
- Semantic color categories
- Theme configuration interfaces

**Integration**:
- ThemeProvider wraps the entire app in `main.tsx`
- All theme tokens imported in `index.css`
- Theme CSS variables can be used directly in components via inline styles
- Example usage in App.tsx demonstrates theme toggle and CSS variable usage

**Tailwind CSS Integration** (`/frontend/src/index.css`):
- Tailwind v4 `@theme` configuration maps all Allegro theme tokens to Tailwind utilities
- Semantic color classes: `bg-primary`, `text-text`, `bg-surface`, `border-border`
- Full color palettes: `bg-orange-500`, `bg-teal-600`, `text-navy-700`, etc.
- Border radius utilities: `rounded-xs`, `rounded-md`, `rounded-lg`
- All utilities automatically adapt to light/dark mode
- Comprehensive documentation in `/frontend/src/theme/TAILWIND.md`
- Components can use Tailwind classes instead of inline styles for cleaner code

**Testing**:
- 8 comprehensive tests covering all theme functionality
- Tests for light/dark mode switching
- localStorage persistence
- Document class application
- System preference detection
- Error handling for hook usage outside provider

**Usage Examples**:
```tsx
// Using CSS variables (original approach)
<div style={{ 
  backgroundColor: 'var(--m-color-card)',
  color: 'var(--m-color-text)'
}}>Content</div>

// Using Tailwind classes (preferred approach)
<div className="bg-surface text-text border border-border rounded-md p-4">
  Content
</div>

// Theme toggling
import { useTheme } from './theme';

function MyComponent() {
  const { mode, toggleMode } = useTheme();
  
  return (
    <button 
      onClick={toggleMode}
      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
    >
      Toggle {mode} mode
    </button>
  );
}
```

## 10. Acceptance Criteria

1. cart with mixed items shows similar layout, spacing, and typography to baseline screenshots.
2. Quantity changes update line totals and summary instantly (<100 ms perceived) and confirm with server quote (<500 ms).
3. Removing an item updates grouping; empty state appears when last item removed.
4. Carousel adds items; totals update; keyboard navigation passes.
6. All endpoints meet tightened performance and error semantics.

## 11. Backend Implementation Details

### 11.1 Product Domain

The Product domain is implemented in the `com.github.pigeon.products` package following a feature-based layout:

**Package Structure:**
- `products/api/` - Public domain models and interfaces
  - `Product` - Record representing a product with all fields (id, sellerId, sellerName, title, imageUrl, attributes, price, listPrice, currency, availability, minQty, maxQty)
  - `Money` - Record for monetary values (amount in grosze, currency)
  - `Availability` - Record for product availability (inStock, maxOrderable)
  - `ProductRepository` - Interface for product data access
- `products/` - Internal implementation
  - `ProductQueries` - Public facade for read operations
  - `ProductCommands` - Public facade for write operations
  - `ProductConfiguration` - Spring configuration (package-private)
  - `ProductRepositoryImpl` - Repository implementation using JPA (package-private)
  - `PersistedProduct` - JPA entity for H2 database (package-private)
  - `PersistedProductRepository` - Spring Data JPA repository (package-private)
  - `ProductDataConfiguration` - Seed data configuration (package-private)

**Domain Validation:**
- Product fields are validated in record constructors
- Money amounts must be non-negative and in PLN currency
- Availability maxOrderable must be non-negative
- Product quantity constraints: minQty and maxQty must be positive, minQty ≤ maxQty
- All required fields validated as non-null and non-blank

**Repository Implementation:**
- Uses H2 in-memory database for local development
- `PersistedProduct` JPA entity with all product fields
- Attributes stored as JSON string for flexibility
- Batch query optimization using `findByIdIn` with JPA query to avoid N+1 problem
- 30 mock products seeded on startup via `ProductDataConfiguration`

**Data Seeding:**
- Mock products from multiple sellers (Electronics Plus, BookWorld, Fashion Hub, Home & Garden, Sports Center)
- Product categories include electronics, books, clothing, home appliances, and sports equipment
- Prices range from 89 PLN to 5,299 PLN
- Includes products with and without list prices (sales)
- One out-of-stock product for testing

**Recommended Products:**
- 12 static recommended products selected for the carousel
- Diverse selection across all 5 sellers
- Price range from 89 PLN to 1,499 PLN
- Includes varied categories (electronics, home appliances, sports, fashion, books)
- Accessible via `GET /api/products/recommended` endpoint
- Products selected: Wireless Mouse, Coffee Machine, Yoga Mat, Sony Headphones, Air Fryer, Ray-Ban Sunglasses, Protein Powder, Tommy Hilfiger Polo, Nespresso, Levi's Jeans, Dumbbell Set, The Pragmatic Programmer

**Architecture Compliance:**
- Configuration classes are package-private
- Only facade classes (Commands/Queries) are public
- Repository implementations are package-private
- Follows established patterns from the issues module

### 11.2 Product REST API

The Product REST API is implemented in the `com.github.pigeon.products.web` package:

**Endpoints:**
- `GET /api/products/{id}` - Retrieves a single product by ID
  - Returns 200 OK with Product object if found
  - Returns 404 Not Found if product doesn't exist
- `GET /api/products?ids=...` - Retrieves multiple products by IDs (batch query)
  - Returns 200 OK with array of Product objects
  - Returns empty array if no products found
  - Optimized to avoid N+1 queries using batch fetch

**OpenAPI Documentation:**
- Full OpenAPI 3.0 annotations on all endpoints
- Available at `/api-docs` (JSON)
- Swagger UI available at `/swagger-ui.html`
- Includes detailed parameter descriptions and response schemas

**Error Handling:**
- RFC 7807 Problem Detail format for all errors
- Global exception handler in `com.github.pigeon.web.GlobalExceptionHandler`
- Returns structured error responses with:
  - `type` - URI identifying the problem type
  - `title` - Human-readable error summary
  - `status` - HTTP status code
  - `detail` - Detailed error message
- Handles IllegalArgumentException (400 Bad Request)
- Generic exception handling for unexpected errors (500 Internal Server Error)

**Performance:**
- p95 latency target: ≤150ms for read operations
- Batch query endpoint optimized with single database query
- Lazy initialization enabled to reduce startup time
- JPA open-in-view disabled to prevent lazy loading issues

### 11.3 Cart Domain

The Cart domain is implemented in the `com.github.pigeon.cart` package following a feature-based layout:

**Package Structure:**
- `cart/api/` - Public domain models and utilities
  - `CartItem` - Record representing an item in the cart (itemId, productId, quantity, price, listPrice)
  - `CartComputed` - Record for computed totals (subtotal, delivery, total)
  - `CartSnapshot` - Record for cart state with items and computed totals
  - `QuoteRequest` - Record for requesting price quotes with nested QuoteItem
  - `QuoteResponse` - Record for quote responses extending CartSnapshot semantics
  - `CartCalculations` - Utility class for all cart calculations with banker's rounding
  - `QuantityValidator` - Utility class for quantity validation and clipping

**Domain Models:**
- All models use records for immutability
- Validation implemented in compact constructors
- Money type from products domain is reused for monetary values
- All amounts stored in grosze (1 PLN = 100 grosze)

**Business Rules:**
The CartCalculations utility implements all cart business logic:
- **LineTotal** = quantity × price
- **SavingsPerLine** = quantity × (listPrice - price), minimum 0
- **Subtotal** = sum of all line totals
- **TotalSavings** = sum of all savings per line
- **GrandTotal** = Subtotal + Delivery

**Currency and Rounding:**
- Currency: PLN (Polish Złoty)
- Precision: 2 decimal places
- Rounding: Banker's rounding (HALF_EVEN) for all calculations
- Uses BigDecimal for precise calculations to avoid floating-point errors
- All calculations convert from grosze to PLN, calculate, then convert back

**Quantity Validation:**
The QuantityValidator utility implements quantity constraint logic:
- Validates and clips quantity to [minQty, min(maxQty, availability.maxOrderable)]
- Default minQty: 1 (if not specified)
- Default maxQty: 99 (if not specified)
- Upper bound is the minimum of maxQty and availability.maxOrderable
- Provides both validation (isValid) and clipping (validateAndClip) methods

**Testing:**
- 76 comprehensive unit tests covering all domain models and utilities
- Tests include validation, edge cases, and banker's rounding scenarios
- All tests pass with 100% success rate
- Tests follow JUnit 5 conventions with descriptive display names

### 11.4 Cart Repository

The Cart repository provides **stateless** cart operations - it does NOT persist cart state. Instead, it validates prices and availability against the Product catalog.

**Package Structure:**
- `cart/api/` - Public domain interfaces
  - `CartRepository` - Interface for stateless cart operations
- `cart/` - Internal implementation
  - `CartRepositoryImpl` - Repository implementation (package-private)
  - `CartConfiguration` - Spring configuration (package-private)

**Implementation Details:**
- **Stateless Design**: No persistence of cart state - all operations are stateless
- **Batch Product Queries**: Fetches all products in a single batch query for efficiency
- **Price Validation**: All prices are validated against the current Product catalog
- **Price Drift Detection**: Prices from quote requests are replaced with current catalog prices
- **Availability Checks**: Validates stock availability using Product.availability data
- **Quantity Clipping**: Clips quantities to [minQty, min(maxQty, availability.maxOrderable)]
- **Zero-Quantity Handling**: Items with zero quantity (out of stock) are excluded from the response

**Core Operations:**
1. `calculateQuote(QuoteRequest)` - Calculates a quote for cart items
   - Validates all product IDs exist in catalog
   - Fetches current prices from Product catalog (price drift detection)
   - Validates and clips quantities based on availability and constraints
   - Excludes items that are out of stock (maxOrderable = 0)
   - Calculates totals using CartCalculations utilities
   - Returns QuoteResponse with validated prices and availability

**Business Logic:**
- Default delivery cost: 0 PLN (configurable in future)
- Items that exceed maxOrderable are clipped to available quantity
- Items that are out of stock (maxOrderable = 0) are excluded from quote
- Unique item IDs (UUIDs) are generated for each cart item
- Cart ID is maintained from request to response

**Error Handling:**
- Throws IllegalArgumentException for:
  - Null quote requests
  - Non-existent product IDs
- Invalid quantities in QuoteRequest are validated by QuoteRequest.QuoteItem

**Integration Tests:**
- 14 comprehensive integration tests using SpringBootTest
- Tests cover:
  - Single and multiple item quotes
  - Price validation from product catalog
  - List price inclusion for savings
  - Quantity clipping to available stock
  - Out of stock handling
  - Batch query efficiency
  - Min/max quantity constraints
  - Null request handling
  - Non-existent product handling
  - Subtotal calculation correctness
  - Default delivery cost
  - Unique item ID generation
  - Cart ID preservation
- All tests passing with real product data from ProductDataConfiguration

**Architecture Compliance:**
- Configuration class is package-private
- Repository implementation is package-private
- Only CartRepository interface is public in api package
- Follows established patterns from products and issues modules

### 11.5 Cart REST API

The Cart REST API is implemented in the `com.github.pigeon.cart.web` package:

**Endpoints:**
- `POST /api/carts/{cartId}/items` - Adds an item to the cart
  - Request body: `{productId: string, quantity: number}`
  - Returns 200 OK with QuoteResponse containing all items and totals
  - Returns 400 Bad Request for invalid product ID or quantity
  - Returns 404 Not Found if product doesn't exist
  - Cart state is maintained in-memory via CartStore
- `PATCH /api/carts/{cartId}/items/{itemId}` - Updates an item's quantity
  - Request body: `{quantity: number}`
  - Returns 200 OK with QuoteResponse containing all items and totals
  - Returns 400 Bad Request if cart or item not found, or invalid quantity
  - Returns 404 Not Found if product doesn't exist
  - Retrieves cart from CartStore, applies update, saves back to CartStore
- `DELETE /api/carts/{cartId}/items/{itemId}` - Removes an item from the cart
  - No request body
  - Returns 200 OK with QuoteResponse containing remaining items and totals
  - Returns 400 Bad Request if cart or item not found
  - Retrieves cart from CartStore, removes item, saves back to CartStore
- `POST /api/carts/{cartId}/quote` - Calculates a quote for the cart
  - Request body: `{cartId: string, items: [{productId, quantity}]}`
  - Returns 200 OK with QuoteResponse with validated prices and availability
  - Returns 400 Bad Request for invalid cart state or items
  - Returns 404 Not Found if product doesn't exist
  - Validates prices against current product catalog and saves to CartStore

**Request DTOs:**
- `AddItemRequest` - Contains productId and quantity only
- `UpdateItemRequest` - Contains quantity only

**Cart Storage:**
- `CartStore` interface - API for managing cart state
- `InMemoryCartStore` - Thread-safe in-memory implementation using ConcurrentHashMap
- Cart snapshots are temporarily stored between requests
- Frontend still manages cart state locally, but backend also maintains it for API operations

**OpenAPI Documentation:**
- Full OpenAPI 3.0 annotations on all endpoints
- Available at `/api-docs` (JSON)
- Swagger UI available at `/swagger-ui.html`
- Includes detailed parameter descriptions, request/response schemas, and error responses

**Error Handling:**
- RFC 7807 Problem Detail format for all errors
- Global exception handler in `com.github.pigeon.web.GlobalExceptionHandler`
- HTTP status codes: 400 (Bad Request), 404 (Not Found)
- Structured error responses with type, title, status, and detail

### 11.6 Comprehensive Error Handling

The application implements comprehensive error handling following RFC 7807 (Problem Details for HTTP APIs) and SHARED-NFR.md requirements.

**Error Handler:**
- `GlobalExceptionHandler` in `com.github.pigeon.web` package
- Extends `ResponseEntityExceptionHandler` for Spring Boot integration
- Returns RFC 7807 Problem Detail responses for all errors
- Logs errors appropriately (debug for 4xx, error for 5xx)
- **No stack traces exposed to clients** - only logged server-side

**Custom Exception Classes:**
- `ResourceNotFoundException` (404) - Resource not found errors
- `ConflictException` (409) - Concurrent modification conflicts
- `PreconditionFailedException` (412) - ETag/If-Match failures
- `DomainValidationException` (422) - Domain-level validation failures
- `RateLimitExceededException` (429) - Rate limit exceeded

**HTTP Status Code Mapping:**
- **400 Bad Request** - Validation shape errors, illegal arguments
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Concurrent modification detected
- **412 Precondition Failed** - ETag/If-Match mismatch
- **422 Unprocessable Entity** - Domain validation failures
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Unexpected errors (stack trace logged only)

**Bean Validation:**
- Spring Boot Starter Validation integrated
- `@Valid` annotations on controller request bodies
- Validation errors return Problem Detail with field-level error details
- Example: `AddItemRequest` validates productId is not blank and quantity is positive

**Rate Limiting:**
- Implemented using Bucket4j (token bucket algorithm)
- `RateLimitInterceptor` in `com.github.pigeon.web.ratelimit` package
- Rate limit: 100 requests per minute per user
- Applied to all `/api/**` endpoints
- Rate limiting headers included in all responses:
  - `X-RateLimit-Limit`: Maximum requests per window (100)
  - `X-RateLimit-Remaining`: Remaining requests in current window
  - `X-RateLimit-Reset`: Unix timestamp when limit resets
- Rate limit exceeded responses include `Retry-After` header

**Problem Detail Response Format:**
```json
{
  "type": "https://api.allegro-style-cart.com/problems/not-found",
  "title": "Resource Not Found",
  "status": 404,
  "detail": "Product not found: prod-123",
  "resourceType": "Product",
  "resourceId": "prod-123"
}
```

**Security:**
- Internal stack traces never exposed to clients
- Error messages sanitized to prevent information leakage
- Authentication/authorization failures return generic messages
- Security events logged for monitoring and alerting

**Testing:**
- Comprehensive error handling tests in `GlobalExceptionHandlerTest`
- Rate limiting tests in `RateLimitTest`
- Tests verify:
  - Correct HTTP status codes
  - RFC 7807 Problem Detail format
  - No stack traces in responses
  - Rate limit headers presence
  - Rate limit enforcement (429 after limit exceeded)
  - Domain validation errors
  - Conflict and precondition failures

**Design:**
The implementation separates HTTP/transport concerns (status codes, headers) from domain logic (validation, business rules). Custom exceptions are thrown from domain/service layers, and the global exception handler translates them into appropriate HTTP responses with RFC 7807 Problem Details.


**Design:**
The implementation uses in-memory storage to maintain cart state between API calls, allowing endpoints to comply with the specification's minimal request body requirements. The CartStore provides:
- Temporary storage of cart snapshots between requests
- Thread-safe concurrent access via ConcurrentHashMap
- Support for the stateless pricing & validation semantic from section 7.3
- No persistent storage - carts are kept in memory only

**Performance:**
- p95 latency target: ≤250ms for mutation operations (add, update, remove)
- p95 latency target: ≤150ms for quote operations
- All cart operations use existing CartRepository.calculateQuote
- Product queries are batch-optimized to avoid N+1 problems
- Virtual threads enabled for improved concurrency

**Testing:**
- 13 comprehensive unit tests with MockMvc in CartControllerTest
- 7 integration tests with real Spring context in CartControllerIntegrationTest  
- 3 performance characterization tests in CartControllerPerformanceTest
- Tests cover all endpoints, error scenarios, and edge cases
- All tests passing with 100% success rate
- Performance tests verify latency targets in test environment

### 11.7 Observability and Metrics

The application implements comprehensive observability following SHARED-NFR.md requirements for monitoring, logging, and metrics collection.

#### Structured JSON Logging

**Configuration:**
- Logback with Logstash encoder for structured JSON logging
- JSON format enabled in production profile (prod, production)
- Human-readable format in development for easier debugging
- Configuration in `logback-spring.xml`

**Log Fields (SHARED-NFR compliant):**
- `timestamp` - ISO-8601 format in UTC
- `level` - Log level (INFO, WARN, ERROR, DEBUG)
- `service` - Service name: "allegro-style-cart-app"
- `environment` - Active Spring profile (dev, prod, etc.)
- `requestId` - Correlation ID for request tracing
- `correlationId` - Same as requestId for cross-service tracing
- `route` - HTTP method and URI path (e.g., "GET /api/products/prod-001")
- `durationMs` - Request duration in milliseconds
- `status` - HTTP status code
- `errorCode` - Error code for 4xx/5xx responses (e.g., "NOT_FOUND", "RATE_LIMIT_EXCEEDED")

**Implementation:**
- `RequestLoggingFilter` - Captures HTTP request/response details and adds to MDC
- Logs INFO for successful requests (2xx/3xx)
- Logs WARN for client errors (4xx)
- Logs ERROR for server errors (5xx)
- All fields added to MDC (Mapped Diagnostic Context) for thread-safe logging

#### Correlation ID Tracking

**Implementation:**
- `RequestCorrelationFilter` - Ensures every request has a correlation ID
- Correlation ID from `X-Correlation-ID` header if provided
- Auto-generated UUID if not provided
- Added to all response headers as `X-Correlation-ID`
- Available in MDC as both `correlationId` and `requestId`
- Cleaned up after request to prevent memory leaks

**Benefits:**
- End-to-end request tracing across distributed systems
- Correlate logs from multiple services for the same request
- Debug production issues by following request flow
- Client can provide correlation ID for troubleshooting

#### Metrics and Monitoring

**Spring Boot Actuator:**
- Enabled management endpoints:
  - `/actuator/health` - Health check with readiness/liveness probes
  - `/actuator/info` - Application information
  - `/actuator/metrics` - Metrics registry
  - `/actuator/prometheus` - Prometheus-formatted metrics
- Health details shown when authorized
- Base path: `/actuator`

**Micrometer Metrics:**
- HTTP server request metrics for all endpoints
- Latency histograms with percentiles: p50, p90, p95, p99
- SLO buckets: 50ms, 100ms, 150ms, 200ms, 250ms, 300ms, 400ms, 500ms, 1s
- Per-endpoint metrics published automatically
- Error rate tracking by status code class (4xx, 5xx)

**Core Metrics (SHARED-NFR compliant):**
- **RPS** (Requests Per Second) - `http.server.requests` count metric
- **Latency Histograms** - p50/p90/p95/p99 percentiles enabled
- **Error Rate** - 4xx and 5xx responses tracked separately
- **Saturation** - JVM metrics (CPU, memory, threads)
- **System Metrics** - Process and system resource usage
- **Logback Metrics** - Log event tracking

**Metric Tags:**
- `application` - Application name
- `environment` - Active profile
- `uri` - Request URI template
- `method` - HTTP method
- `status` - HTTP status code
- `exception` - Exception class name (if applicable)

**Prometheus Export:**
- Enabled for Prometheus scraping
- Metrics exposed at `/actuator/prometheus`
- Histogram data in Prometheus format
- Compatible with Grafana dashboards

#### Testing

**Observability Tests:**
- `RequestCorrelationFilterTest` - Tests correlation ID generation and propagation
  - Generates UUID when not provided
  - Preserves correlation ID when provided
  - Handles empty/blank correlation IDs
  - Includes correlation ID in error responses
- `ActuatorEndpointsTest` - Tests actuator endpoint availability
  - Health endpoint accessible
  - Metrics endpoint accessible
  - Prometheus endpoint accessible
  - Info endpoint accessible
  - HTTP server requests metrics published

**Test Coverage:**
- 9 new tests for observability features
- All tests passing
- Integration tests verify metrics collection
- Correlation ID propagation tested end-to-end

#### Monitoring Best Practices

**Alerting (planned):**
- Elevated 5xx error rate (> 1% of requests)
- p95/p99 latency SLO breach (p95 > 250ms for writes, > 150ms for reads)
- Abnormal 429 rate limit surge
- Error budget burn rate
- Health check failures

**Dashboards (planned):**
- Request rate by endpoint
- Latency percentiles by endpoint
- Error rate by status code
- Resource utilization (CPU, memory, threads)
- JVM metrics (heap, GC, class loading)

**Log Aggregation:**
- Structured JSON logs ready for log aggregation systems
- Correlation IDs enable distributed tracing
- All required fields present per SHARED-NFR
- No PII in logs (only product IDs, cart IDs, user IDs)

## 12. Frontend Product API Implementation

### 12.1 API Client Architecture

The frontend Product API client is implemented in the `/frontend/src/api` directory with a clean separation of concerns:

**HTTP Client (`http-client.ts`):**
- Base wretch client configured for `/api` endpoints
- Default JSON headers
- Correlation ID generation using `crypto.randomUUID()`
- Automatic header injection via `withCorrelationId()` helper

**Product API (`products.ts`):**
- `getProduct(id)` - Fetches a single product by ID
- `getProducts(ids)` - Fetches multiple products by IDs (batch query)
- `getRecommendedProducts()` - Fetches recommended products for carousel
- All functions include correlation ID in headers
- Type-safe with TypeScript types from OpenAPI spec

**React Query Hooks (`useProducts.ts`):**
- `useProduct(id)` - Hook for fetching single product
- `useProducts(ids)` - Hook for fetching multiple products
- `useRecommendedProducts()` - Hook for fetching recommended products
- Query key factory pattern for cache invalidation
- Exponential backoff retry logic (3 retries, max 30s delay)
- Configured stale times: 5 minutes for products, 10 minutes for recommendations

### 12.2 Error Handling and Retry Logic

**Retry Strategy:**
- 3 retry attempts on failure
- Exponential backoff: `min(1000 * 2^attemptIndex, 30000)` ms
- Automatic retry on network errors and 5xx responses
- No retry on 4xx client errors

**Error Propagation:**
- React Query error states exposed via hooks
- Correlation IDs tracked for debugging
- Errors bubble up to component level for UI handling

### 12.3 Type Safety

**Generated Types (`api-types.ts`):**
- Auto-generated from OpenAPI spec via `npm run generate-types`
- Product, Money, Availability interfaces match backend models
- Type-only imports for better tree-shaking
- Kept in sync with backend API changes

**Type Coverage:**
```typescript
interface Product {
  id?: string;
  sellerId?: string;
  sellerName?: string;
  title?: string;
  imageUrl?: string;
  attributes?: Record<string, string>[];
  price?: Money;
  listPrice?: Money;
  currency?: string;
  availability?: Availability;
  minQty?: number;
  maxQty?: number;
}

interface Money {
  amount?: number; // in grosze (1 PLN = 100 grosze)
  currency?: string; // "PLN"
}

interface Availability {
  inStock?: boolean;
  maxOrderable?: number;
}
```

### 12.4 Testing

**Unit Tests (`products.test.ts`):**
- 7 tests covering all API functions
- Mock wretch HTTP client
- Verify correlation ID inclusion
- Test empty array handling
- Test URL parameter construction

**React Query Tests (`useProducts.test.tsx`):**
- 6 tests covering all hooks
- Test successful data fetching
- Test loading states
- Test query key generation
- Test enabled/disabled queries (empty IDs)
- QueryClient with retry disabled for tests

**Test Coverage:**
- 21 total tests for Product API
- All tests passing
- Mocked HTTP layer for isolation
- Fast execution (<2s)

### 12.5 Usage Examples

**Basic Product Fetch:**
```typescript
import { useProduct } from './api';

function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, error } = useProduct(id);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!product) return null;
  
  return <div>{product.title}</div>;
}
```

**Batch Product Fetch:**
```typescript
import { useProducts } from './api';

function CartItems({ productIds }: { productIds: string[] }) {
  const { data: products, isLoading } = useProducts(productIds);
  
  if (isLoading) return <div>Loading products...</div>;
  
  return (
    <div>
      {products?.map(product => (
        <div key={product.id}>{product.title}</div>
      ))}
    </div>
  );
}
```

**Recommended Products:**
```typescript
import { useRecommendedProducts } from './api';

function RecommendedCarousel() {
  const { data: products } = useRecommendedProducts();
  
  return (
    <div className="carousel">
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### 12.6 Cache Management

**Query Keys:**
- Structured query keys enable precise cache invalidation
- Hierarchical key structure: `['products', 'detail', id]`
- Bulk invalidation: `queryClient.invalidateQueries({ queryKey: productKeys.all })`
- Selective invalidation: `queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })`

**Stale Time Configuration:**
- Products: 5 minutes (balance between freshness and performance)
- Recommended products: 10 minutes (changes infrequently)
- Background refetch on window focus
- Automatic garbage collection after queries become inactive

### 12.7 Performance Considerations

**Optimization Strategies:**
- Batch queries via `getProducts(ids)` to avoid N+1 problems
- React Query deduplication prevents duplicate requests
- Automatic request caching reduces network calls
- Optimistic updates prepared for mutations (future)

**Network Efficiency:**
- Correlation IDs for request tracing
- Compressed responses (gzip)
- Efficient URL parameter encoding for batch queries
- Configurable retry delays to avoid overwhelming backend

## 13. Frontend Cart API Implementation

### 13.1 Cart API Client Architecture

The frontend Cart API client is implemented in the `/frontend/src/api` directory following the same patterns as the Product API:

**HTTP Client (`http-client.ts`):**
- Base wretch client configured for `/api` endpoints
- Correlation ID generation using `crypto.randomUUID()`
- Automatic header injection for all requests

**Cart API (`cart.ts`):**
- `addToCart(cartId, request)` - POST /api/carts/{cartId}/items
- `updateQuantity(cartId, itemId, request)` - PATCH /api/carts/{cartId}/items/{itemId}
- `removeItem(cartId, itemId)` - DELETE /api/carts/{cartId}/items/{itemId}
- `getQuote(request)` - POST /api/carts/{cartId}/quote
- All functions include correlation ID in headers
- Type-safe with TypeScript types from OpenAPI spec

**React Query Hooks (`useCart.ts`):**
- `useAddToCart(cartId)` - Hook for adding items with optimistic updates
- `useUpdateQuantity(cartId)` - Hook for updating quantity with optimistic updates
- `useRemoveItem(cartId)` - Hook for removing items with optimistic updates
- `useGetQuote()` - Hook for getting quotes with debouncing (300ms delay)
- Query key factory pattern for cache management
- Exponential backoff retry logic (3 retries, max 30s delay)

### 13.2 Optimistic Updates

All mutation hooks implement optimistic updates to provide instant UI feedback:

**Add to Cart:**
- Immediately adds item to local cart state
- Generates temporary item ID
- Rolls back on API error
- Invalidates cache on completion

**Update Quantity:**
- Immediately updates item quantity in local state
- Preserves all other item properties
- Rolls back on API error
- Invalidates cache on completion

**Remove Item:**
- Immediately removes item from local state
- Rolls back on API error
- Invalidates cache on completion

### 13.3 Debounced Quote Requests

The `useGetQuote` hook implements debouncing to prevent excessive API calls:

**Debounce Strategy:**
- 300ms delay (middle of 200-400ms requirement range)
- Custom `useDebounce` hook for delayed execution
- Multiple rapid calls coalesced into single API request
- Cache updated on successful quote response

**Use Cases:**
- Price validation during cart changes
- Availability checks
- Delivery cost recalculation
- Savings computation

### 13.4 Error Handling and Rollback

**Error Propagation:**
- React Query error states exposed via hooks
- Correlation IDs tracked for debugging
- Errors bubble up to component level for UI handling
- RFC 7807 Problem Detail responses

**Rollback Mechanism:**
- Optimistic updates automatically rolled back on error
- Previous cart state preserved in mutation context
- Cache restored to pre-mutation state
- Error details available in hook return value

### 13.5 Type Safety

**Generated Types (`api-types.ts`):**
- Auto-generated from OpenAPI spec via `npm run generate-types`
- CartItem, CartSnapshot, QuoteRequest, QuoteResponse interfaces match backend models
- AddItemRequest, UpdateItemRequest for mutations
- Type-only imports for better tree-shaking
- Kept in sync with backend API changes

**Type Coverage:**
```typescript
interface CartItem {
  itemId?: string;
  listPrice?: Money;
  price?: Money;
  productId?: string;
  quantity?: number;
}

interface CartSnapshot {
  cartId?: string;
  items?: CartItem[];
  computed?: CartComputed;
}

interface QuoteRequest {
  cartId?: string;
  items?: QuoteItem[];
}

interface QuoteResponse {
  cartId?: string;
  computed?: CartComputed;
  items?: CartItem[];
}
```

### 13.6 Testing

**Unit Tests (`cart.test.ts`):**
- 6 tests covering all API functions
- Mock wretch HTTP client
- Verify correlation ID inclusion
- Test request parameter construction
- Test all HTTP methods (POST, PATCH, DELETE)

**React Query Tests (`useCart.test.tsx`):**
- 9 tests covering all hooks
- Test successful mutations
- Test API parameter passing
- Test query key generation
- QueryClient with retry disabled for tests
- Fast execution (<2s)

**Test Coverage:**
- 15 total tests for Cart API
- All tests passing
- Mocked HTTP layer for isolation
- Type-safe test assertions

### 13.7 Usage Examples

**Add to Cart:**
```typescript
import { useAddToCart } from './api';

function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart("cart-123");
  
  const handleAddToCart = () => {
    addToCart.mutate({
      productId: product.id!,
      quantity: 1,
    });
  };
  
  return (
    <button onClick={handleAddToCart} disabled={addToCart.isPending}>
      {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

**Update Quantity:**
```typescript
import { useUpdateQuantity } from './api';

function CartItem({ item, cartId }: { item: CartItem, cartId: string }) {
  const updateQuantity = useUpdateQuantity(cartId);
  
  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity.mutate({
      itemId: item.itemId!,
      request: { quantity: newQuantity },
    });
  };
  
  return (
    <input
      type="number"
      value={item.quantity}
      onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
    />
  );
}
```

**Remove Item:**
```typescript
import { useRemoveItem } from './api';

function CartItem({ item, cartId }: { item: CartItem, cartId: string }) {
  const removeItem = useRemoveItem(cartId);
  
  const handleRemove = () => {
    removeItem.mutate(item.itemId!);
  };
  
  return (
    <button onClick={handleRemove} disabled={removeItem.isPending}>
      Remove
    </button>
  );
}
```

**Get Quote (Debounced):**
```typescript
import { useGetQuote } from './api';

function CartSummary({ cartId, items }: { cartId: string, items: QuoteItem[] }) {
  const getQuote = useGetQuote();
  
  useEffect(() => {
    // This will be debounced - only called once after 300ms of no changes
    getQuote.mutate({
      cartId,
      items,
    });
  }, [cartId, items, getQuote]);
  
  if (getQuote.isPending) return <div>Calculating...</div>;
  if (getQuote.isError) return <div>Error calculating total</div>;
  
  return (
    <div>
      <div>Subtotal: {getQuote.data?.computed?.subtotal?.amount} PLN</div>
      <div>Total: {getQuote.data?.computed?.total?.amount} PLN</div>
    </div>
  );
}
```

### 13.8 Cache Management

**Query Keys:**
- Structured query keys enable precise cache invalidation
- Hierarchical key structure: `['cart', cartId]`
- Quote-specific keys: `['cart', cartId, 'quote']`
- Bulk invalidation: `queryClient.invalidateQueries({ queryKey: cartKeys.all })`
- Selective invalidation: `queryClient.invalidateQueries({ queryKey: cartKeys.cart(cartId) })`

**Cache Behavior:**
- Optimistic updates provide instant UI feedback
- Server responses overwrite optimistic state
- Automatic cache invalidation after mutations
- No stale time configured (always fresh after mutation)
- Background refetch disabled (mutations handle updates)

### 13.9 Performance Considerations

**Optimization Strategies:**
- Optimistic updates eliminate perceived latency
- Debounced quote calls reduce API load (300ms delay)
- React Query deduplication prevents duplicate requests
- Automatic request caching when applicable
- Efficient rollback mechanism on errors

**Network Efficiency:**
- Correlation IDs for request tracing and debugging
- Minimal request payloads (only changed data)
- Batch operations not needed (server handles efficiently)
- Retry logic with exponential backoff prevents API hammering
