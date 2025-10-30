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

## Technical Infrastructure

### Backend Architecture
- **Language & Runtime**: Java 25 with Virtual Threads enabled for improved concurrency
- **Framework**: Spring Boot 3.5.6
- **Package Layout**: Feature-based with limited visibility (only Commands/Queries facades are public)
- **Architecture Enforcement**: ArchUnit tests validate architectural patterns

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
- **Monitoring**: Spring Boot Actuator with health probes enabled
- **Logging**: Structured JSON format with timestamp, level, service, environment, thread, logger, message, exception
- **Documentation**: SpringDoc OpenAPI (Swagger UI available)

### Security
- **Authentication**: 
  - Development: Form-based login with in-memory user (admin/password)
  - Production: OAuth2 Resource Server with JWT validation
- **Authorization**: Enforced on all `/api/**` and `/` endpoints
- **Session**: CSRF protection disabled for REST APIs, session management via Spring Session JDBC

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
