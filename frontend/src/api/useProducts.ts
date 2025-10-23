import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { Product } from "../api-types";
import {
  getProduct,
  getProducts,
  getRecommendedProducts,
} from "../api/products";

/**
 * Query key factory for products
 */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (ids: string[]) => [...productKeys.lists(), ids] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  recommended: () => [...productKeys.all, "recommended"] as const,
};

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(
  id: string,
  options?: Omit<UseQueryOptions<Product, Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Hook to fetch multiple products by IDs
 */
export function useProducts(
  ids: string[],
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: productKeys.list(ids),
    queryFn: () => getProducts(ids),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: ids.length > 0,
    ...options,
  });
}

/**
 * Hook to fetch recommended products
 */
export function useRecommendedProducts(
  options?: Omit<UseQueryOptions<Product[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery({
    queryKey: productKeys.recommended(),
    queryFn: () => getRecommendedProducts(),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 10 * 60 * 1000, // 10 minutes - recommended products don't change often
    ...options,
  });
}
