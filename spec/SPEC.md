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

**Architecture Compliance:**
- Configuration classes are package-private
- Only facade classes (Commands/Queries) are public
- Repository implementations are package-private
- Follows established patterns from the issues module
