# Allegro-Style Cart Application Specification

## 1. Overview

A web application that replicates the cart currently found at `https://allegro.pl/koszyk`. The UI
supports adding items to the cart, editing quantities, removing items, automatic price recalculation (including **“you
save PLN X”** based on list vs effective price), an **empty state**, and a **recommended products carousel** enabling
one‑click add‑to‑cart. Persistence is **local (browser)**; a lightweight backend provides product/price data,
availability validation, and recommendation feeds.

> **Visual parity mandate**: Layout, spacing, typography, colors, iconography placement, and interactive states **must
be indistinguishable** from Allegro’s cart in the provided screenshots. Where exact tokens (font family, sizes, hex
> colors) are unknown, implement using design tokens and verify via screenshot‑diff tests until <1% pixel delta.

## 2. Target Users

* **Primary**: Shoppers adding and reviewing items prior to checkout.
* **Secondary**: Guest users evaluating costs; returning users managing carts across sessions (locally on the same
  device).
* **Assistive tech users**: Full keyboard navigation, screen readers, and high‑contrast users.

## 3. Key Features

1. **cart page (full view)**

    * Seller sections (“Parcel from …”), line items with thumbnail, title, attributes, unit price, quantity stepper,
      line total, remove icon.
    * Collapsible seller group and master “entire cart” checkbox UI.
    * Right‑side **order summary panel** with subtotal, savings, delivery (static or computed), grand total, CTA
      buttons (**Delivery and Payment**, **Continue Shopping**), and coupon hint area.
    * Informational boxes (e.g., Buyer Protection) as in screenshots.
2. **Empty state** identical to Allegro’s (illustration area, copy, suggested products row).
3. **Recommended products carousel** (“Add it to your shipment!”) with horizontal scroll, price cards, and **To cart**
   buttons; adds directly to cart.
4. **Interactions**

    * Quantity increment/decrement with min/max and validation; immediate totals update.
    * Remove line item.
    * Add from recommendations.
    * Automatic **“You save PLN X”** computed as sum(quantity × (listPrice − price)).
5. **Localization**: Polish copy by default; architecture supports i18n.
6. **Accessibility**: Keyboard and screen‑reader friendly. Focus rings and aria labels on controls.

## 4. Functional Requirements

### 4.1 UI/UX (FR‑U)

* **FR‑U‑1 Pixel accuracy**: Implement a theme using design tokens; deliver Cypress visual regression with screenshot
  overlay threshold **≤ 1%** against provided baselines for: Empty cart, cart with ≥2 sellers and ≥3 items, Carousel
  visible.
* **FR‑U‑2 Layout grid**: 12‑column content grid with fixed max width matching screenshots; right summary panel fixed
  width; gutters and card paddings matched by measurement.
* **FR‑U‑3 Typography**: Use system/embedded font stack tuned to match screenshot metrics (x‑height, weight, tracking).
  Provide font‑scale tokens (xs, sm, base, md, lg) mapped to pixel values achieving identical line breaks.
* **FR‑U‑4 Colors & states**: Define tokens for background, surface, text‑primary/secondary, accent‑orange (CTA), muted
  borders, success/info; hover/active/disabled states mirror Allegro.
* **FR‑U‑5 Icons**: Use look‑alike vector icons matched in size/placement (trash/delete, heart, cart, lock).
* **FR‑U‑6 Quantity stepper**: Keyboard accessible (`ArrowUp/ArrowDown`, `Home/End` to min/max); prevents non‑numeric
  input; enforces constraints.
* **FR‑U‑7 Price formatting**: Prices in **PLN** with comma decimal separator and narrow space thousands separator;
  price/unit meta where applicable.
* **FR‑U‑8 Savings**: Display “you save PLN X” in the summary when any item has `listPrice > price`.
* **FR‑U‑9 Recommendations carousel**: Lazy loads 8–24 items; keyboard scroll; snap alignment; per‑card **To cart**
  control.
* **FR‑U‑10 Empty state**: When cart empty, show hero illustration + suggestions strip; hide right summary panel.
* **FR‑U‑11 Error banners**: Non‑blocking inline error rows for transient errors (e.g., price changed on refresh).

### 4.2 cart domain (FR‑B)

* **FR‑B‑1 Item model**:
  `{ itemId, productId, title, sellerId, sellerName, imageUrl, attributes[], quantity, minQty=1, maxQty=99, step=1, price, listPrice, currency="PLN", availability: { inStock, maxOrderable }, shippingGroupId }`.
* **FR‑B‑2 Grouping**: UI groups items by `sellerId` with a header matching the “Parcel from {seller}” block.
* **FR‑B‑3 Calculations**:

    * LineTotal = `quantity × price`.
    * SavingsPerLine = `quantity × (listPrice − price)` (min 0).
    * Subtotal = sum(LineTotal).
    * SavingsTotal = sum(SavingsPerLine).
    * Delivery = from API `shippingQuote` or **0** if not provided (configurable).
    * GrandTotal = `Subtotal + Delivery`.
* **FR‑B‑4 Validation**: Quantity changes clipped to `[minQty, min(maxQty, availability.maxOrderable)]`.
* **FR‑B‑5 Persist & recover**: cart JSON stored under `localStorage["cart.v1"]` and restored on app load;
  schema‑versioned with migration hook.
* **FR‑B‑6 Sync with pricing**: On each add/remove/qty change, call **Pricing Quote API** to verify current prices and
  stock; reconcile UI if deltas.
* **FR‑B‑7 Idempotency**: Client generates `Idempotency-Key` (UUID) per mutate call; backend echoes original result on
  replay.

### 4.3 Recommendations (FR‑R)

* **FR‑R‑1 Feed**: `GET /v1/recommendations?context=cart&sellerId=…&limit=…` returns items that fit the current cart
  context.
* **FR‑R‑2 Add from carousel**: Clicking **To cart** adds with default quantity (respecting min/step) and triggers
  recalculation.

### 4.4 Accessibility & i18n (FR‑A)

* **FR‑A‑1** All interactive controls reachable via keyboard (`Tab` order, skip links).
* **FR‑A‑2** Live region announces quantity and total changes.
* **FR‑A‑3** Screen‑reader labels mirror visual text (Polish default); resource files allow future locales.

### 4.5 State & Error Handling (FR‑S)

* **FR‑S‑1** Network errors show inline retry with backoff.
* **FR‑S‑2** Price/stock drift: if API returns different `price` or `availability`, highlight the line and update
  totals.
* **FR‑S‑3** Remove item confirmation optionally enabled via config.

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

High‑level wireframes capturing structure and spacing. (Final visual parity validated via screenshot‑diff tests.)

### 6.1 Empty cart

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Header bar]                                                                 │
│                                                                              │
│  [Hero Illustration]     "Twój koszyk jest pusty" + helper copy              │
│                                                                              │
│  [Suggested Products Row: card • card • card • … →]                          │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 cart With Items

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Header bar]                                                                 │
│                                                                              │
│ ┌───────────────────────────────┐  ┌───────────────────────────────────────┐ │
│ │ [Seller Group Header]        │  │  Order Summary Panel                  │ │
│ │  "Parcel from {seller}"      │  │  • Value of products … PLN XXXX,XX   │ │
│ │  [checkbox] [collapse]       │  │  • Delivery … PLN XX,XX               │ │
│ ├───────────────────────────────┤  │  • You save PLN XX,XX                 │ │
│ │  [Thumb] [Title] [Stepper]   │  │  [DELIVERY AND PAYMENT] (primary)     │ │
│ │  [Price] [Line Total] [bin]  │  │  [CONTINUE SHOPPING] (secondary)      │ │
│ ├───────────────────────────────┤  │  [Coupons hint] [Buyer Protection]    │ │
│ │  [More items…]               │  └───────────────────────────────────────┘ │
│ └───────────────────────────────┘                                           │
│                                                                              │
│ [Add it to your shipment!]  [carousel cards with To cart buttons →]          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 7. API Specification

> Base path: `/v1` (JSON over HTTPS). All responses use `application/json; charset=utf-8`.

### 7.1 Authentication & Headers

* `Authorization: Bearer <token>` (optional for demo; if absent, use anonymous/guest context)
* `Idempotency-Key: <uuid>` for POST/PATCH/DELETE
* `X-Request-Id: <uuid>` (echoed)
* `Accept-Language: pl-PL`

### 7.2 Models

```ts
Product
{
    id: string,
        sellerId
:
    string,
        sellerName
:
    string,
        title
:
    string,
        imageUrl
:
    string,
        attributes ? : Array<{ name: string, value: string }>,
        price
:
    Money,          // effective price used for totals
        listPrice ? : Money,     // when present and > price, shows savings
        currency
:
    'PLN',
        availability
:
    {
        inStock: boolean, maxOrderable
    :
        number
    }
,
    minQty ? : number, maxQty ? : number, step ? : number,
}

Money
{
    amount: number, precision
:
    2, currency
:
    'PLN'
}

CartItem
{
    itemId: string,            // uuid (client‑generated)
        productId
:
    string,
        quantity
:
    number,
        price
:
    Money,
        listPrice ? : Money,
}

CartSnapshot
{
    cartId: string,            // uuid (client‑generated, persisted locally)
        items
:
    CartItem[],
        computed
:
    {
        subtotal: Money,
            savings
    :
        Money,
            delivery
    :
        Money,
            total
    :
        Money
    }
}

QuoteRequest
{
    cartId: string,
        items
:
    Array<{ productId: string, quantity: number }>
}

QuoteResponse
extends
CartSnapshot
with server‑
validated
prices & availability
```

### 7.3 Endpoints

**Products**

* `GET /v1/products/{id}` → `Product`
* `GET /v1/products?ids=…` → `Product[]`

**Recommendations**

* `GET /v1/recommendations?context=cart&sellerId={sid}&limit={n}` → `Product[]`

**Cart (stateless pricing & validation)**

* `POST /v1/carts/{cartId}/items` body: `{ productId, quantity }` → `QuoteResponse`
* `PATCH /v1/carts/{cartId}/items/{itemId}` body: `{ quantity }` → `QuoteResponse`
* `DELETE /v1/carts/{cartId}/items/{itemId}` → `QuoteResponse`
* `POST /v1/carts/{cartId}/quote` body: `QuoteRequest` → `QuoteResponse`

> Notes:
>
> * Backend **does not persist** server‑side carts; it validates and returns authoritative price/stock and a recomputed
    snapshot. Client persists locally.
> * Idempotency applies to mutate calls.

**Errors**
All errors follow common envelope:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "…",
    "details": {}
  }
}
```

HTTP semantics: 400/401/403/404/409/412/422/429/5xx per shared NFR.

## 8. Data & Business Rules

* Currency: **PLN**, precision **2**; rounding **banker’s rounding**.
* Savings = Σ `max(listPrice−price, 0) × quantity`.
* Delivery defaults to **0** unless `shippingQuote` provided; can be toggled via config.
* Max quantity per item default **99** unless restricted by availability.
* Promotions: **omitted** (no bulk or fifth‑item rules).

## 9. Frontend Architecture

* **State**: UI state in a centralized store; derived totals computed from store selectors. Debounced API quote on
  mutations (e.g., 200–400 ms).
* **Persistence**: Serialize cart to `localStorage` after each confirmed mutation; schema version key
  `cart.schema=1`.
* **Routing**: Single page: `/koszyk`.
* **Testing**: Unit (calculations), integration (quantity/remove/add flows), **visual regression** (pixel parity),
  Lighthouse accessibility.

## 10. Acceptance Criteria

1. cart with mixed items shows identical layout, spacing, and typography to baseline screenshots (≤1% diff).
2. Quantity changes update line totals and summary instantly (<100 ms perceived) and confirm with server quote (<500
   ms).
3. Removing an item updates grouping; empty state appears when last item removed.
4. Carousel adds items; totals update; keyboard navigation passes.
5. “You save PLN X” equals computed savings from list vs price across items.
6. All endpoints meet tightened performance and error semantics.

## 11. Open Questions

1. Exact **color hex values** and **font family**: should we extract via design tool from additional references, or
   accept screenshot‑diff as authority?
2. Delivery calculation: static 0 PLN vs API‑provided shipping quote—confirm final approach.
3. Coupon area: show as placeholder only (non‑functional) or integrate a simple code validator?
4. Illustration & icons: may we use custom look‑alike assets to avoid trademark concerns while preserving layout?

---

**Appendix A — Design Tokens (to be finalized during pixel‑match pass)**

```
--color-bg = TBD (dark)
--color-surface = TBD (near-black)
--color-text = TBD (high-contrast)
--color-accent = TBD (orange CTA)
--radius-card = 8px
--shadow-card = 0 1px 2px rgba(0,0,0,.4)
--font-base = system-ui, "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif
--font-size-sm/base/md/lg = TBD to match line breaks
--space-1 = 4px; --space-2 = 8px; --space-3 = 12px; --space-4 = 16px; --space-6 = 24px
```
