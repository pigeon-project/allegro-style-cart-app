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
6. Each cart item shows:
   - Product image thumbnail
   - Product title
   - Quantity selector (1 to 99)
   - Price per unit (smaller when quantity > 1)
   - Total price for that item (price * quantity). Displayed only when quantity > 1.
   - Remove icon
7. Entire cart bar is displayed at the top with:
   - "Select All" checkbox on the left
   - The "Remove" link on the right. When clicked, a dropdown menu appears with two working options:
     - "Remove selected items"
     - "Remove all items"

### Overall technical requirements:
- Cart changes are visible immediately (use optimistic updates, requests are done in the background).
- Light and dark mode supported
- Fully responsive UI (mobile, tablet, desktop) with adaptive layouts, touch-friendly interaction.

## Non-Functional Requirements (Reference)
This product relies on the shared organization-wide Non-Functional Requirements: [Shared NFR](SHARED-NFR.md)

## Deployment

### Container Image
The application is packaged as a production-ready Docker container with the following characteristics:

**Build Process:**
- Multi-stage Dockerfile with separate build stages for optimal layer caching
- Backend built with Gradle and Java 25 (Eclipse Temurin JDK)
- Frontend built with npm/Vite (automatically invoked via Gradle)
- Final runtime image uses Eclipse Temurin JRE (Debian-based)
- Non-root user (`spring:spring`) for enhanced security
- Image size: ~389MB (optimized with minimal dependencies)

**Runtime Configuration:**
- Base image: `eclipse-temurin:25-jre` (Debian)
- Non-root execution with dedicated `spring` user
- JVM optimized for containers:
  - `-XX:MaxRAMPercentage=75.0` - Uses 75% of available container memory
  - `-XX:+UseZGC -XX:+ZGenerational` - Z Garbage Collector for low latency
- Port: 8080 (HTTP)
- Profiles:
  - `default` - Development mode with H2 in-memory database and form login
  - `production` - Production mode with external database and OAuth2 JWT

**Health Checks:**
- Liveness probe: `GET /actuator/health/liveness` (container is alive)
- Readiness probe: `GET /actuator/health/readiness` (ready to serve traffic)
- Health check interval: 30s, timeout: 3s, start period: 60s, retries: 3
- Compliant with SHARED-NFR Section 2 (Availability requirements)

**Environment Variables:**
- `SPRING_PROFILES_ACTIVE` - Set to `production` for production deployment
- `JDBC_DATABASE_URL` - JDBC connection URL (e.g., `jdbc:mysql://host:port/db`)
- `JDBC_DATABASE_USERNAME` - Database username
- `JDBC_DATABASE_PASSWORD` - Database password
- `JAVA_TOOL_OPTIONS` - JVM options (default configured for container optimization)

**Build Command:**
```bash
docker build -t allegro-cart:latest .
```

**Run Command (Development):**
```bash
docker run -d -p 8080:8080 -e SPRING_PROFILES_ACTIVE=default allegro-cart:latest
```

**Run Command (Production):**
```bash
docker run -d -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=production \
  -e JDBC_DATABASE_URL=jdbc:mysql://db-host:3306/cartdb \
  -e JDBC_DATABASE_USERNAME=cartuser \
  -e JDBC_DATABASE_PASSWORD=securepassword \
  allegro-cart:latest
```

**Security Features:**
- Non-root container user
- Minimal attack surface (JRE only, no build tools)
- No secrets in image (configured via environment variables)
- Regular base image updates via Eclipse Temurin project

**Kubernetes Considerations:**
- Use liveness and readiness probes for health monitoring
- Configure resource requests/limits based on workload
- Use external ConfigMaps/Secrets for database credentials
- Recommended replicas: 2+ for high availability (99.9% SLO)

## Technical Infrastructure

### Frontend Architecture
- **Build Tool**: Vite 7.1.12 with React plugin
- **Framework**: React 19.2.0 with TypeScript 5.9.3
- **Styling**: Tailwind CSS 4.1.13 with @tailwindcss/vite plugin
- **Routing**: TanStack Router for file-based routing
- **State Management**: TanStack Query (React Query) 5.90.5 for server state with optimistic updates
- **HTTP Client**: Wretch 3.0.2 for API calls
- **API Client Layer**: 
  - Type-safe API client with automatic retry logic for idempotent operations (GET, PUT, DELETE)
  - Exponential backoff with jitter for 5xx server errors (base: 100ms, max: 5000ms, max retries: 3)
  - Automatic handling of 429 rate limit responses with Retry-After header
  - Network error recovery for transient failures
  - ETag-based concurrency control for cart updates
  - React Query hooks with optimistic updates for immediate UI feedback
- **Dark Mode**: 
  - System preference detection with manual toggle, persisted to localStorage
  - Custom `useDarkMode` hook with `useCallback` for stable function references
  - Toggle button component with professional sun/moon icons (@tabler/icons-react)
  - Smooth 200ms CSS transitions between themes (cubic-bezier timing function)
  - All components styled for both light and dark modes
  - Color contrast meets WCAG AA standards:
    - Light mode: slate-900 text on gray-50 background (contrast ratio: 17.5:1)
    - Dark mode: slate-100 text on slate-900 background (contrast ratio: 15.5:1)
    - Interactive elements: indigo-500 focus rings (contrast ratio: 4.7:1)
  - Keyboard accessible with focus indicators
  - Touch-friendly 44px minimum touch target size
  - Theme preference saved on initialization and toggle
  - Unit tested with 17 comprehensive test cases
  - E2E tested for toggle functionality
- **Development Server**: Vite dev server on port 5173 with proxy to backend (port 8080)
- **Testing**:
  - Unit/Integration: Vitest 4.0.5 with jsdom environment
  - React Testing: @testing-library/react 16.3.0 with user-event 14.6.1
  - E2E: Playwright 1.56.1 with Chromium, Firefox, and WebKit support
- **Code Quality**:
  - Linting: ESLint 9.38.0 with TypeScript, React, and React Query plugins
  - Formatting: Prettier 3.6.2
  - Pre-commit: Husky 9.1.7 with lint-staged
- **Type Generation**: Automated OpenAPI-to-TypeScript conversion via swagger-typescript-api
- **Build Output**: `frontend/build/dist/static/` (served by backend in production)

### Backend Architecture
- **Language & Runtime**: Java 25 with Virtual Threads enabled for improved concurrency
- **Framework**: Spring Boot 3.5.6
- **Package Layout**: Feature-based with limited visibility (only Commands/Queries facades are public)
- **Architecture Enforcement**: ArchUnit tests validate the following architectural patterns:
  - Controllers must be package-private and reside in `web` packages
  - Configuration classes must be package-private and end with `Configuration`
  - Repository classes must be package-private
  - No field injection allowed (constructor injection required)
  - No deprecated Spring APIs used
  - Only facade classes (ending with `Commands` or `Queries`) should be public
- **Dependency Injection**: Constructor injection only (no field injection via `@Autowired`)
- **Configuration**: Prefer `@Configuration` classes over `@Component` and `@Service`

### Database Configuration
- **Development**: H2 in-memory database (jdbc:h2:mem:testdb)
- **Production**: JDBC-compatible database (MySQL/PostgreSQL) via environment variables:
  - `JDBC_DATABASE_URL`
  - `JDBC_DATABASE_USERNAME`
  - `JDBC_DATABASE_PASSWORD`
- **ORM**: Spring Data JPA with Hibernate
- **Connection Pooling**: HikariCP (default in Spring Boot)

### Session Management
- **Type**: JDBC-based HTTP sessions (Spring Session)
- **Development**: H2 schema automatically initialized
- **Production**: MySQL schema used (schema-mysql.sql)
- **Benefits**: Horizontal scalability, session persistence across restarts

### Observability
- **Health Endpoints**: `/actuator/health`, `/actuator/health/liveness`, `/actuator/health/readiness`
- **Metrics Endpoints**: `/actuator/metrics`, `/actuator/prometheus`
- **Monitoring**: Spring Boot Actuator with health probes enabled
- **Logging**: 
  - Structured JSON format with timestamp, level, service, environment, requestId, route, thread, logger, message, exception
  - Request tracing via X-Request-ID header (auto-generated if not provided)
  - Per-request logging with duration metrics (durationMs)
  - Status-based log levels: INFO (2xx/3xx), WARN (4xx), ERROR (5xx)
  - No raw PII in logs (only hashed/ID references)
  - Actuator endpoints excluded from detailed request logging
- **Metrics**:
  - Core metrics: RPS, latency histograms (p50, p90, p95, p99), error rates by status class (4xx/5xx)
  - Saturation metrics: JVM memory (used/max), system CPU usage, process CPU usage
  - HTTP server request metrics with percentile histograms
  - Distribution percentiles: 0.5, 0.9, 0.95, 0.99
  - SLO buckets: 50ms, 100ms, 200ms, 250ms, 400ms, 500ms, 1s, 2s
  - Common tags: application name, environment
- **Security Event Logging**:
  - Authentication successes and failures logged with username and error type
  - Authorization denials logged with username and resource
- **Alert Configuration** (see `observability-alerts.yaml`):
  - Elevated 5xx error rate (threshold: 5% over 5 minutes)
  - Read endpoint p95 latency breach (threshold: 250ms)
  - Write endpoint p95 latency breach (threshold: 400ms)
  - p99 latency breach (threshold: 1000ms over 5 minutes)
  - Abnormal error rate (threshold: 10% over 5 minutes)
  - Memory saturation (threshold: 90% of max heap)
  - CPU saturation (threshold: 80% CPU usage)
  - Authentication failure spike (threshold: 10 per minute)
- **Service Level Objectives (SLOs)**:
  - Availability: 99.9% uptime per month
  - Read latency p95: ≤250ms
  - Write latency p95: ≤400ms
  - Error budget: 0.1%
- **Documentation**: SpringDoc OpenAPI (Swagger UI available)

### Security
- **Authentication**: 
  - Development: Form-based login with in-memory user (admin/password)
  - Production: OAuth2 Resource Server with JWT validation
- **Authorization**: Enforced on all `/api/**` and `/` endpoints
- **Session**: CSRF protection disabled for REST APIs, session management via Spring Session JDBC
- **Rate Limiting** (SHARED-NFR §13):
  - Per-user rate limiting enforced on all authenticated endpoints
  - Default: 60 requests per minute per user
  - Rate limit headers included in all responses:
    - `X-RateLimit-Limit`: Maximum requests allowed per minute
    - `X-RateLimit-Remaining`: Remaining requests in current window
    - `X-RateLimit-Reset`: Unix timestamp when limit resets
  - HTTP 429 (Too Many Requests) returned when limit exceeded
  - `Retry-After` header included in 429 responses with seconds until retry
  - Configurable via `rate-limit.enabled` and `rate-limit.requests-per-minute` properties
  - Actuator and public endpoints excluded from rate limiting
- **Input Validation** (SHARED-NFR §10, §13):
  - Text inputs trimmed and NFC-normalized before validation
  - Allowlist validation for text fields using Unicode-aware patterns
  - Product titles: letters, numbers, spaces, and common punctuation
  - Validation errors return HTTP 400 with detailed problem details
- **Security Event Logging** (SHARED-NFR §5):
  - Authentication successes and failures logged with username
  - Authorization denials logged with username and resource
  - Rate limit violations logged with user and endpoint
- **Secrets Management** (SHARED-NFR §5):
  - Database credentials via environment variables (JDBC_DATABASE_*)
  - OAuth2 JWT configuration via Spring Security
  - No secrets in source control
- **Least Privilege** (SHARED-NFR §5):
  - Database access controlled via Spring Data JPA
  - Service accounts use minimal required permissions

## Frontend Components

### CartHeader Component
A React component that provides cart-wide selection and removal controls at the top of the shopping cart.

**Purpose**: Enables users to select or deselect all items in the cart at once and provides bulk removal options through a dropdown menu.

**Key Features**:
- **"Select All" checkbox**: Select/deselect all cart items with a single click
- **Indeterminate state**: Visual indication when some (but not all) items are selected
- **Selection counter**: Displays count of selected items (e.g., "4 of 5 selected")
- **Remove dropdown menu**: Provides two removal options
  - "Remove selected items" - Only enabled when items are selected
  - "Remove all items" - Always available
- **Confirmation dialogs**: Shows confirmation prompts for both remove operations
- **Keyboard navigation**: 
  - Escape key closes the dropdown
  - Proper focus management
- **Click-outside handling**: Dropdown closes when clicking outside
- **Responsive design**: Adapts layout for mobile, tablet, and desktop viewports
- **Dark mode support**: Full theming integration with dark mode styles
- **Accessibility**: 
  - Proper ARIA labels and roles
  - Dialog attributes for confirmation modals
  - Touch-friendly controls (44px minimum touch target)

**Props**:
- `totalItems` (number): Total number of items in the cart
- `selectedItems` (number): Number of currently selected items
- `allSelected` (boolean): Whether all items are selected
- `indeterminate` (boolean): Whether some (but not all) items are selected
- `onSelectAll` (function): Callback when "Select All" is toggled
- `onRemoveSelected` (function): Callback to remove selected items
- `onRemoveAll` (function): Callback to remove all items

**Implementation Details**:
- Located at: `frontend/src/components/CartHeader.tsx`
- Test coverage: 33 comprehensive test cases covering:
  - Select all functionality and indeterminate state
  - Dropdown menu interactions (open/close/click outside)
  - Remove operations with confirmation dialogs
  - Keyboard navigation (Escape key)
  - Accessibility attributes
  - Touch-friendly design
  - Dark mode support
- Uses React hooks: `useState`, `useRef`, `useEffect`

**Usage Example**:
```tsx
<CartHeader
  totalItems={items.length}
  selectedItems={selectedItemIds.size}
  allSelected={allSelected}
  indeterminate={indeterminate}
  onSelectAll={handleSelectAll}
  onRemoveSelected={handleRemoveSelected}
  onRemoveAll={handleRemoveAll}
/>
```

### SellerGroup Component
A React component that groups cart items by seller with comprehensive selection management.

**Purpose**: Groups multiple cart items from the same seller into a single visual unit with a seller-level checkbox for batch selection.

**Key Features**:
- **Seller-level checkbox**: Select/deselect all items from a seller with a single click
- **Indeterminate state**: Visual indication when only some items are selected from a seller
- **Seller information display**: Shows seller name and item count (with proper singular/plural handling)
- **Selection tracking**: Displays count of selected items when any are selected
- **Performance optimized**: Uses `useMemo` to avoid unnecessary recalculations of selection state
- **Responsive design**: Adapts layout for mobile, tablet, and desktop viewports
- **Dark mode support**: Full theming integration with dark mode styles
- **Accessibility**: Proper ARIA labels and touch-friendly controls (44px minimum touch target)

**Props**:
- `sellerId` (string): Unique identifier for the seller
- `sellerName` (string): Display name for the seller
- `items` (CartItemResponse[]): Array of cart items from this seller
- `selectedItemIds` (Set<string>): Set of currently selected item IDs
- `onSelectionChange` (function): Callback for individual item selection changes
- `onSellerSelectionChange` (function): Callback for seller-level selection changes
- `onQuantityChange` (function): Callback for quantity changes
- `onRemove` (function): Callback for item removal

**Implementation Details**:
- Located at: `frontend/src/components/SellerGroup.tsx`
- Test coverage: 27 comprehensive test cases
- Integrates seamlessly with existing `CartItem` component
- Uses React hooks: `useMemo`, `useEffect`, `useRef`

**Usage Example**:
```tsx
<SellerGroup
  sellerId="seller-123"
  sellerName="TechStore Electronics"
  items={sellerItems}
  selectedItemIds={selectedItemIds}
  onSelectionChange={handleSelectionChange}
  onQuantityChange={handleQuantityChange}
  onRemove={handleRemove}
/>
```

### RecommendedProducts Component
A React component that displays a carousel of recommended products with one-click add-to-cart functionality.

**Purpose**: Demonstrates product recommendations with seamless shopping experience, allowing users to quickly add items to their cart without leaving the current page.

**Key Features**:
- **Product carousel**: Displays 6 mocked products with images, titles, and prices
- **One-click add-to-cart**: Each product card has an "Add to Cart" button that adds the item with optimistic updates
- **Desktop arrow navigation**: Previous/Next buttons on either side of the carousel (hidden on mobile)
- **Touch-friendly swipe gestures**: Supports pointer events for swiping on mobile/tablet devices
- **Keyboard navigation**: Arrow keys (Left/Right) navigate through the carousel when focused
- **Dot indicators**: Visual pagination dots show current position and allow direct navigation
- **Smooth animations**: Uses react-spring for fluid carousel transitions
- **Success toast notification**: Shows a temporary green toast when an item is successfully added
- **Responsive layout**: Adapts items per view based on viewport (1 on mobile, 2 on tablet, 3 on desktop)
- **Dark mode support**: Full theming integration with dark mode styles
- **Loading states**: Disables all add-to-cart buttons during mutation
- **Accessibility**: 
  - Proper ARIA labels and roles
  - Keyboard focusable carousel container
  - Touch-friendly controls (44px minimum touch target)
  - Screen reader friendly toast alerts

**Implementation Details**:
- Located at: `frontend/src/components/RecommendedProducts.tsx`
- Mock data at: `frontend/src/data/mockProducts.ts`
- Test coverage: 29 comprehensive test cases covering:
  - Component rendering and product display
  - Add-to-cart functionality with optimistic updates
  - Carousel navigation (arrows, dots, keyboard, swipe gestures)
  - Success toast display and auto-hide
  - Responsive behavior
  - Dark mode support
  - Accessibility features
  - Touch/swipe gesture support
- Uses React hooks: `useState`, `useRef`, `useEffect`
- Integrates with `useAddCartItem` mutation from React Query
- Uses `react-spring` for animations

**Usage Example**:
```tsx
<RecommendedProducts />
```

**Technical Notes**:
- Automatically calculates items per view based on window width
- Handles pointer events for touch/mouse interactions
- Prevents navigation beyond carousel boundaries
- Cleans up event listeners on unmount

### CartSummary Component
A React component that displays the order summary with total price calculation for selected cart items.

**Purpose**: Provides a comprehensive summary panel showing the total price of selected items with PLN currency formatting, enabling users to proceed to checkout.

**Key Features**:
- **Price calculation**: Dynamically calculates total price of selected items only
- **PLN currency formatting**: Displays prices in Polish format (e.g., 123,45 zł) with comma as decimal separator
- **Dynamic updates**: Updates immediately when items are selected/deselected or quantities change
- **Responsive layout**: 
  - Desktop: Sticky sidebar positioned on the right (top: 4 spacing units)
  - Mobile/Tablet: Fixed bar at the bottom of the viewport with compact layout
- **Selection counter**: Shows count of selected items with proper singular/plural handling
- **Checkout button**: 
  - Enabled when items are selected with "Proceed to Checkout" text
  - Disabled when no items selected with "Select items" text
  - Proper ARIA labels for accessibility
- **Dark mode support**: Full theming integration with dark mode styles
- **Touch-friendly**: Minimum 44px touch targets for mobile interactions

**Props**:
- `items` (CartItemResponse[]): Array of all cart items
- `selectedItemIds` (Set<string>): Set of currently selected item IDs

**Implementation Details**:
- Located at: `frontend/src/components/CartSummary.tsx`
- Test coverage: 32 comprehensive test cases covering:
  - Price calculation logic (selected items, quantity changes, edge cases)
  - PLN currency formatting with various amounts
  - Dynamic updates on selection and quantity changes
  - Selected items counter display
  - Checkout button states (enabled/disabled)
  - Responsive layout rendering
- Uses React hooks: `useMemo` for performance-optimized price calculations
- Price calculation: Uses `totalPrice` field if available, otherwise calculates from `pricePerUnit * quantity`
- Handles edge cases: missing prices, quantities, fractional cents, very large amounts

**Usage Example**:
```tsx
<CartSummary 
  items={cartItems} 
  selectedItemIds={selectedItemIds} 
/>
```

**Visual Design**:
- Desktop: White/dark background, rounded corners, shadow, sticky positioning
- Mobile: Full-width fixed bottom bar with compact horizontal layout
- Selected items count displayed prominently
- Total price in large, bold indigo text
- Professional Allegro-style design matching existing components

### Cart Page
A React route component that serves as the main shopping cart page, integrating all cart components with routing and state management.

**Purpose**: Provides the complete cart experience with TanStack Router integration, React Query state management, and all cart components working together seamlessly.

**Key Features**:
- **TanStack Router integration**: File-based routing with root and index routes
- **Global state management**: React Query with optimistic updates for all mutations
- **Component integration**: Orchestrates CartHeader, SellerGroup, CartSummary, EmptyCart, and RecommendedProducts
- **Loading states**: Spinner during initial load, overlay during mutations
- **Error handling**: User-friendly error messages with retry functionality
- **Seller grouping**: Items automatically grouped by sellerId with display names
- **Selection management**: Local state for item selection with bulk operations
- **Dark mode**: Global toggle accessible from fixed position (top-right)
- **Responsive design**: Mobile (fixed bottom summary), tablet, desktop (sticky sidebar summary)
- **Keyboard navigation**: Full keyboard accessibility for all interactive elements
- **Loading overlay**: Displayed for mutations exceeding 250ms (optimistic updates happen immediately)

**Routes**:
- `/` - Main cart page (index route)
- Root route provides dark mode toggle accessible from all pages

**State Management**:
- `useCart` - Fetches cart data with automatic caching (stale time: 1 minute)
- `useRemoveCartItems` - Removes multiple items or all items with optimistic updates
- `useUpdateCartItemQuantity` - Updates quantity with ETag concurrency control
- `useRemoveCartItem` - Removes single item with optimistic updates
- Local selection state managed via `useState<Set<string>>`

**Implementation Details**:
- Located at: `frontend/src/routes/index.tsx`
- Root route at: `frontend/src/routes/__root.tsx`
- Router config: `frontend/src/router.ts`
- E2E test coverage: 6 comprehensive tests covering:
  - Page rendering and dark mode toggle
  - Empty cart state display
  - Cart with items display
  - Cart summary visibility
  - Authentication flow
  - Page load states
- Uses React hooks: `useState`, `useMemo`
- Integrates with `cart-api.ts` for all backend operations
- ETags passed to mutations for optimistic concurrency control

**Usage Example**:
The cart page is automatically rendered when navigating to the root path (`/`). The router is configured in `main.tsx`:

```tsx
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

<RouterProvider router={router} />
```

**Visual Design**:
- Desktop: Two-column layout (cart items + sticky sidebar summary)
- Mobile: Single column with fixed bottom summary bar
- Dark mode: Full theming with toggle in top-right corner
- Loading: Centered spinner with message
- Error: Centered error message with retry button
- Professional Allegro-style design matching existing components

## Domain Model Implementation

### Cart Domain
The cart functionality is implemented following the feature-based architecture pattern with clear separation between domain and persistence layers.

#### Domain Models (Records)
- **Cart**: Represents a user's shopping cart
  - `id` (UUID): Unique cart identifier
  - `userId` (String): Owner of the cart
- **CartItem**: Represents a product in the cart
  - `id` (UUID): Unique item identifier
  - `cartId` (UUID): Reference to parent cart
  - `sellerId` (UUID): Reference to seller
  - `productImage` (String, optional): Product thumbnail URL
  - `productTitle` (String, required): Product name/title
  - `pricePerUnit` (BigDecimal, required): Price per single unit
  - `quantity` (int, 1-99): Number of items (validated)
  - `totalPrice()` method: Calculates price * quantity
- **Seller**: Represents a marketplace seller
  - `id` (UUID): Unique seller identifier
  - `name` (String): Seller name

#### Data Integrity
Following SHARED-NFR Section 10 requirements:
- **Primary Keys**: All entities use UUID primary keys with `@GeneratedValue(strategy = GenerationType.UUID)`
- **Foreign Keys**: CartItem references Cart via `cartId` and Seller via `sellerId` (enforced via JPA relationships)
- **Uniqueness Constraints**: 
  - Cart has unique constraint on `user_id` (one cart per user)
  - Seller has unique constraint on `name`
- **Validation Constraints**:
  - Quantity: Min=1, Max=99 (enforced at domain and entity level)
  - Non-null constraints on required fields
  - Length limits on text fields (productTitle: 500, sellerName: 200)
- **Timestamps**: All entities include `created_at` and `updated_at` with automatic management via `@PrePersist` and `@PreUpdate`
- **Indexes**: CartItem table includes indexes on `cart_id` and `seller_id` for efficient queries

#### Repository Layer
Split between domain and database implementations:
- **CartRepository** (interface in `cart.api` package): Domain repository contract
- **CartRepositoryImpl**: Bridges domain and persistence layers
- **PersistedCart/CartItem/Seller**: JPA entities with validation
- **PersistedCart/CartItem/SellerRepository**: Spring Data JPA repositories

#### Facades
Public API exposed via:
- **CartCommands**: Create cart, add/update/remove items, create sellers
- **CartQueries**: Retrieve cart, items, sellers (by various criteria)

#### REST API Endpoints

The cart functionality is exposed via REST API endpoints following OpenAPI 3.0 specification.

##### GET /api/cart
Retrieves the current user's shopping cart with all items. Auto-creates cart if it doesn't exist.

**Response (200 OK):**
- Returns `CartResponse` with cart ID, user ID, and list of items
- Includes `ETag` header for concurrency control

**Error Responses:**
- 401 Unauthorized - User not authenticated
- 404 Not Found - Cart not found (auto-creates in current implementation)

##### POST /api/cart/items
Adds a new item to the shopping cart. Creates cart if it doesn't exist.

**Request Body:**
```json
{
  "sellerId": "uuid",
  "productImage": "string (optional)",
  "productTitle": "string (required, max 500 chars)",
  "pricePerUnit": "decimal (required, positive)",
  "quantity": "integer (required, 1-99)"
}
```

**Response (201 Created):**
- Returns `Location` header with URI of created item
- Empty body

**Error Responses:**
- 400 Bad Request - Validation errors (missing fields, invalid format)
- 401 Unauthorized - User not authenticated
- 422 Unprocessable Entity - Domain validation errors (e.g., quantity out of range)

##### PUT /api/cart/items/{id}
Updates the quantity of a specific cart item.

**Request Headers:**
- `If-Match: "etag"` (optional) - ETag for optimistic concurrency control

**Request Body:**
```json
{
  "quantity": "integer (required, 1-99)"
}
```

**Response (204 No Content):**
- Empty body

**Error Responses:**
- 400 Bad Request - Validation errors
- 401 Unauthorized - User not authenticated
- 404 Not Found - Item not found or doesn't belong to user's cart
- 412 Precondition Failed - ETag mismatch (cart was modified)
- 422 Unprocessable Entity - Domain validation errors

##### DELETE /api/cart/items/{id}
Removes a specific item from the cart.

**Response (204 No Content):**
- Empty body

**Error Responses:**
- 401 Unauthorized - User not authenticated
- 404 Not Found - Item not found or doesn't belong to user's cart

##### DELETE /api/cart/items
Removes multiple items or all items from the cart.

**Query Parameters:**
- `all=true` (optional) - Remove all items

**Request Body (optional):**
```json
{
  "itemIds": ["uuid1", "uuid2", ...]
}
```

**Behavior:**
- If `all=true` or no request body: removes all cart items
- If request body provided: removes specified items

**Response (204 No Content):**
- Empty body

**Error Responses:**
- 400 Bad Request - Validation errors (empty itemIds list)
- 401 Unauthorized - User not authenticated
- 404 Not Found - Cart not found or specified item doesn't belong to user's cart

#### Error Handling

All error responses follow RFC7807 Problem Details format:

```json
{
  "type": "https://api.allegro-cart.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Validation failed for one or more fields",
  "instance": "/api/cart/items",
  "errors": {
    "quantity": "Quantity must be at least 1"
  }
}
```

Error types:
- `validation-error` (400) - Request validation failures
- `not-found` (404) - Resource not found
- `conflict` (409) - Resource conflict
- `precondition-failed` (412) - ETag mismatch
- `domain-validation-error` (422) - Business logic validation failures

#### Concurrency Control

Cart operations use ETags for optimistic concurrency control:
1. GET /api/cart returns an ETag header
2. Client includes `If-Match: "etag"` header in PUT requests
3. Server validates ETag before modification
4. Returns 412 Precondition Failed if ETag doesn't match (cart was modified by another request)

ETag is calculated based on cart ID and all item IDs with their quantities, ensuring detection of any cart modifications.

#### Security

All endpoints require authentication:
- Development: Form-based login (username: admin, password: password)
- Production: OAuth2 JWT tokens
- Authorization enforced server-side - users can only access their own cart

---
