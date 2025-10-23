import type { Product } from "../api-types";
import { createHttpClient, withCorrelationId } from "./http-client";

/**
 * Get a single product by ID
 */
export async function getProduct(id: string): Promise<Product> {
  const client = createHttpClient();
  return withCorrelationId(client).url(`/products/${id}`).get().json<Product>();
}

/**
 * Get multiple products by IDs
 */
export async function getProducts(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) {
    return [];
  }

  const client = createHttpClient();
  const params = new URLSearchParams();
  ids.forEach((id) => params.append("ids", id));

  return withCorrelationId(client)
    .url(`/products?${params.toString()}`)
    .get()
    .json<Product[]>();
}

/**
 * Get recommended products for the carousel
 */
export async function getRecommendedProducts(): Promise<Product[]> {
  const client = createHttpClient();
  return withCorrelationId(client)
    .url("/products/recommended")
    .get()
    .json<Product[]>();
}
