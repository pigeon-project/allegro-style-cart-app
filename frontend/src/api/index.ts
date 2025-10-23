// API client functions
export { getProduct, getProducts, getRecommendedProducts } from "./products";

// React Query hooks
export {
  useProduct,
  useProducts,
  useRecommendedProducts,
  productKeys,
} from "./useProducts";

// HTTP client utilities
export { createHttpClient, withCorrelationId } from "./http-client";
