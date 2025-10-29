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

---
