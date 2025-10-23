// API client functions
export { getProduct, getProducts, getRecommendedProducts } from "./products";
export { addToCart, updateQuantity, removeItem, getQuote } from "./cart";

// React Query hooks
export {
  useProduct,
  useProducts,
  useRecommendedProducts,
  productKeys,
} from "./useProducts";
export {
  useAddToCart,
  useUpdateQuantity,
  useRemoveItem,
  useGetQuote,
  cartKeys,
} from "./useCart";

// HTTP client utilities
export { createHttpClient, withCorrelationId } from "./http-client";
