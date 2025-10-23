import type {
  QuoteResponse,
  QuoteRequest,
  AddItemRequest,
  UpdateItemRequest,
} from "../api-types";
import { createHttpClient, withCorrelationId } from "./http-client";

/**
 * Add an item to the cart
 * @param cartId - Cart identifier
 * @param request - Item to add (productId and quantity)
 * @returns Quote response with updated cart state
 */
export async function addToCart(
  cartId: string,
  request: AddItemRequest,
): Promise<QuoteResponse> {
  const client = createHttpClient();
  return withCorrelationId(client)
    .url(`/carts/${cartId}/items`)
    .post(request)
    .json<QuoteResponse>();
}

/**
 * Update quantity of an item in the cart
 * @param cartId - Cart identifier
 * @param itemId - Item identifier
 * @param request - New quantity
 * @returns Quote response with updated cart state
 */
export async function updateQuantity(
  cartId: string,
  itemId: string,
  request: UpdateItemRequest,
): Promise<QuoteResponse> {
  const client = createHttpClient();
  return withCorrelationId(client)
    .url(`/carts/${cartId}/items/${itemId}`)
    .patch(request)
    .json<QuoteResponse>();
}

/**
 * Remove an item from the cart
 * @param cartId - Cart identifier
 * @param itemId - Item identifier
 * @returns Quote response with updated cart state
 */
export async function removeItem(
  cartId: string,
  itemId: string,
): Promise<QuoteResponse> {
  const client = createHttpClient();
  return withCorrelationId(client)
    .url(`/carts/${cartId}/items/${itemId}`)
    .delete()
    .json<QuoteResponse>();
}

/**
 * Get a quote for the cart with validated prices and availability
 * @param request - Quote request with cart items
 * @returns Quote response with server-validated prices
 */
export async function getQuote(request: QuoteRequest): Promise<QuoteResponse> {
  const client = createHttpClient();
  return withCorrelationId(client)
    .url(`/carts/${request.cartId}/quote`)
    .post(request)
    .json<QuoteResponse>();
}
