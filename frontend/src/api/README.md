# Product API Client

This module provides a type-safe Product API client with React Query hooks for the Allegro-style cart application.

## Features

- ✅ **Type-safe** - TypeScript types auto-generated from OpenAPI spec
- ✅ **React Query** - Built-in caching, deduplication, and background refetching
- ✅ **Correlation IDs** - Automatic request tracking for debugging
- ✅ **Retry Logic** - Exponential backoff with configurable retry attempts
- ✅ **Error Handling** - Comprehensive error states and propagation
- ✅ **Batch Queries** - Efficient multi-product fetching

## Installation

The API client is already included in the project. Just import what you need:

```typescript
import { useProduct, useProducts, useRecommendedProducts } from "./api";
```

## API Functions

### `getProduct(id: string): Promise<Product>`

Fetches a single product by ID.

```typescript
import { getProduct } from "./api";

const product = await getProduct("prod-001");
```

### `getProducts(ids: string[]): Promise<Product[]>`

Fetches multiple products by IDs in a single request.

```typescript
import { getProducts } from "./api";

const products = await getProducts(["prod-001", "prod-002", "prod-003"]);
```

### `getRecommendedProducts(): Promise<Product[]>`

Fetches recommended products for the carousel.

```typescript
import { getRecommendedProducts } from "./api";

const recommended = await getRecommendedProducts();
```

## React Query Hooks

### `useProduct(id: string)`

React Query hook for fetching a single product.

```typescript
function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!product) return null;

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.price.amount / 100} PLN</p>
    </div>
  );
}
```

### `useProducts(ids: string[])`

React Query hook for fetching multiple products.

```typescript
function CartItems({ productIds }: { productIds: string[] }) {
  const { data: products, isLoading, error } = useProducts(productIds);

  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Failed to load products</div>;

  return (
    <div>
      {products?.map((product) => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.price.amount / 100} PLN</p>
        </div>
      ))}
    </div>
  );
}
```

### `useRecommendedProducts()`

React Query hook for fetching recommended products.

```typescript
function RecommendedCarousel() {
  const { data: products, isLoading } = useRecommendedProducts();

  if (isLoading) return <div>Loading recommendations...</div>;

  return (
    <div className="carousel">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

## Advanced Usage

### Custom Query Options

All hooks accept custom React Query options:

```typescript
const { data } = useProduct("prod-001", {
  staleTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  enabled: someCondition,
});
```

### Cache Invalidation

Use the query key factory for precise cache invalidation:

```typescript
import { productKeys } from "./api";
import { useQueryClient } from "@tanstack/react-query";

function MyComponent() {
  const queryClient = useQueryClient();

  const handleUpdate = () => {
    // Invalidate all product queries
    queryClient.invalidateQueries({ queryKey: productKeys.all });

    // Invalidate specific product
    queryClient.invalidateQueries({ queryKey: productKeys.detail("prod-001") });

    // Invalidate all product lists
    queryClient.invalidateQueries({ queryKey: productKeys.lists() });
  };
}
```

### Error Handling

All hooks expose React Query error states:

```typescript
const { data, error, isError, isLoading } = useProduct(id);

if (isError) {
  console.error("Failed to fetch product:", error);
  // Handle error in UI
}
```

## Configuration

### Retry Logic

By default, the hooks retry failed requests 3 times with exponential backoff:

- Retry 1: After 1 second
- Retry 2: After 2 seconds
- Retry 3: After 4 seconds
- Max delay: 30 seconds

### Stale Time

- Products: 5 minutes
- Recommended products: 10 minutes

These can be overridden per query using the `options` parameter.

### Correlation IDs

Every request automatically includes a unique correlation ID in the `X-Correlation-ID` header for request tracing and debugging.

## Testing

### Unit Tests

Run unit tests with mocked HTTP client:

```bash
npm test
```

All unit tests use mocked HTTP responses and don't require the backend to be running.

### Integration Testing

For integration testing with the real backend, use the e2e test suite with Playwright:

```bash
# Ensure backend is running
./gradlew bootRun

# Run e2e tests (in a separate terminal)
cd frontend
npx playwright test
```

## Types

### Product

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
```

### Money

```typescript
interface Money {
  amount?: number; // in grosze (1 PLN = 100 grosze)
  currency?: string; // "PLN"
}
```

### Availability

```typescript
interface Availability {
  inStock?: boolean;
  maxOrderable?: number;
}
```

## Performance

- **Automatic caching** - React Query caches responses to minimize network requests
- **Request deduplication** - Multiple components requesting the same data will share a single request
- **Background refetching** - Stale data is refetched in the background on window focus
- **Batch queries** - Use `useProducts()` instead of multiple `useProduct()` calls for better performance

## Troubleshooting

### Backend not responding

Ensure the backend is running on `http://localhost:8080`:

```bash
./gradlew bootRun
```

### Type errors after API changes

Regenerate TypeScript types from OpenAPI spec:

```bash
cd frontend
npm run generate-types
```

### Stale cache data

Clear React Query cache:

```typescript
queryClient.clear();
// or
queryClient.invalidateQueries({ queryKey: productKeys.all });
```
