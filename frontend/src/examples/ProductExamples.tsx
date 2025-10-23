/**
 * Example component demonstrating Product API usage
 *
 * This component shows:
 * - Fetching a single product
 * - Fetching multiple products
 * - Fetching recommended products
 * - Error handling
 * - Loading states
 */

import { useProduct, useProducts, useRecommendedProducts } from "../api";

// Example 1: Single Product
export function ProductDetail({ id }: { id: string }) {
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded">
        Error loading product: {error.message}
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-2">{product.title}</h2>
      <p className="text-gray-600 mb-2">{product.sellerName}</p>
      <div className="flex items-baseline gap-2">
        {product.listPrice &&
          product.listPrice.amount! > product.price!.amount! && (
            <span className="text-gray-400 line-through">
              {product.listPrice.amount! / 100} PLN
            </span>
          )}
        <span className="text-2xl font-bold text-green-600">
          {product.price!.amount! / 100} PLN
        </span>
      </div>
      {product.availability?.inStock ? (
        <p className="text-green-600 mt-2">
          In stock ({product.availability.maxOrderable} available)
        </p>
      ) : (
        <p className="text-red-600 mt-2">Out of stock</p>
      )}
    </div>
  );
}

// Example 2: Multiple Products
export function CartItemsList({ productIds }: { productIds: string[] }) {
  const { data: products, isLoading, error } = useProducts(productIds);

  if (isLoading) {
    return <div>Loading cart items...</div>;
  }

  if (error) {
    return <div>Error loading cart items: {error.message}</div>;
  }

  if (!products || products.length === 0) {
    return <div>No products found</div>;
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-4 p-4 border rounded"
        >
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-semibold">{product.title}</h3>
            <p className="text-sm text-gray-600">{product.sellerName}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">{product.price!.amount! / 100} PLN</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Example 3: Recommended Products Carousel
export function RecommendedProductsCarousel() {
  const { data: products, isLoading } = useRecommendedProducts();

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="min-w-[200px] h-[250px] bg-gray-200 rounded animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recommended for you</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[200px] p-4 border rounded hover:shadow-lg transition-shadow"
          >
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-32 object-cover rounded mb-2"
            />
            <h3 className="font-semibold text-sm mb-1 line-clamp-2">
              {product.title}
            </h3>
            <p className="text-xs text-gray-600 mb-2">{product.sellerName}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-green-600">
                {product.price!.amount! / 100} PLN
              </span>
              <button className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600">
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
