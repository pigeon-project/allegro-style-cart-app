# Allegro-Style Cart Application Specification

## Product Overview

###  What is this product
A new version of the shopping cart currently found at `https://allegro.pl/koszyk`.
The version preserves functionalities and overall UI structure.

The UI supports adding items to the cart, editing quantities, removing items, an **empty state**.

The UI supports a mocked recommended products carousel to demonstrate one‑click add‑to‑cart.

### For whom is this product
Users adding and reviewing items prior to checkout.

## Functional Requirements (Product-Level)

1. Cart items are grouped by seller.
2. Show empty cart screen when no items are in the cart.
3. Summary panel with the total price of selected cart items.
4. English language baseline (centrally managed copy). Currency in PLN
5. Entire cart, seller, and each item can be selected with checkboxes for checkout or removal.

### Overall technical requirements:
- Cart changes are visible immediately (use optimistic updates, requests are done in the background).
- Light and dark mode supported
- Fully responsive UI (mobile, tablet, desktop) with adaptive layouts, touch-friendly interaction.
-

## Non-Functional Requirements (Reference)
This product relies on the shared organization-wide Non-Functional Requirements: [Shared NFR](SHARED-NFR.md)

---
