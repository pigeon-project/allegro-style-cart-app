import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { createApiClient, withRetry } from "./api-client";
import type {
  CartResponse,
  AddCartItemRequest,
  UpdateCartItemRequest,
  RemoveCartItemsRequest,
  CartItemResponse,
} from "../api-types";

const api = createApiClient();

/**
 * Query keys for cart operations
 */
export const cartKeys = {
  all: ["cart"] as const,
  cart: () => [...cartKeys.all, "current"] as const,
};

/**
 * Get the current user's cart
 * Supports ETag for concurrency control
 */
export async function getCart(): Promise<{
  data: CartResponse;
  etag: string | null;
}> {
  return withRetry(async () => {
    const response = await api.url("/api/cart").get().res();
    const data = await response.json<CartResponse>();
    const etag = response.headers.get("ETag");
    return { data, etag };
  }, "GET");
}

/**
 * Add an item to the cart
 */
export async function addCartItem(
  request: AddCartItemRequest,
): Promise<string> {
  // POST is not idempotent, so no retry
  const response = await api.url("/api/cart/items").post(request).res();
  const location = response.headers.get("Location");
  return location || "";
}

/**
 * Update cart item quantity
 * Supports ETag for optimistic concurrency control
 */
export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
  etag?: string,
): Promise<void> {
  const request: UpdateCartItemRequest = { quantity };
  return withRetry(async () => {
    const wretchInstance = api.url(`/api/cart/items/${itemId}`);
    if (etag) {
      wretchInstance.headers({ "If-Match": etag });
    }
    await wretchInstance.put(request).res();
  }, "PUT");
}

/**
 * Remove a single cart item
 */
export async function removeCartItem(itemId: string): Promise<void> {
  return withRetry(async () => {
    await api.url(`/api/cart/items/${itemId}`).delete().res();
  }, "DELETE");
}

/**
 * Remove multiple cart items or all items
 */
export async function removeCartItems(
  itemIds?: string[],
  removeAll = false,
): Promise<void> {
  return withRetry(async () => {
    const url = removeAll ? `/api/cart/items?all=true` : `/api/cart/items`;

    if (removeAll || !itemIds) {
      await api.url(url).delete().res();
    } else {
      const request: RemoveCartItemsRequest = { itemIds };
      await api.url(url).body(request).delete().res();
    }
  }, "DELETE");
}

/**
 * React Query hook to fetch cart
 */
export function useCart(
  options?: Omit<
    UseQueryOptions<{ data: CartResponse; etag: string | null }>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: getCart,
    ...options,
  });
}

/**
 * React Query hook to add item to cart with optimistic updates
 */
export function useAddCartItem(
  options?: UseMutationOptions<string, Error, AddCartItemRequest>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCartItem,
    onMutate: async (newItem) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<{
        data: CartResponse;
        etag: string | null;
      }>(cartKeys.cart());

      // Optimistically update to the new value
      if (previousCart) {
        const optimisticItem: CartItemResponse = {
          id: `temp-${Date.now()}`,
          cartId: previousCart.data.cartId,
          sellerId: newItem.sellerId,
          productImage: newItem.productImage,
          productTitle: newItem.productTitle,
          pricePerUnit: newItem.pricePerUnit,
          quantity: newItem.quantity,
          totalPrice: newItem.pricePerUnit * newItem.quantity,
        };

        queryClient.setQueryData(cartKeys.cart(), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: [...(previousCart.data.items || []), optimisticItem],
          },
        });
      }

      // Return context with snapshot
      return { previousCart };
    },
    onError: (err, _newItem, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    ...options,
  });
}

/**
 * React Query hook to update cart item quantity with optimistic updates
 */
export function useUpdateCartItemQuantity(
  options?: UseMutationOptions<
    void,
    Error,
    { itemId: string; quantity: number; etag?: string }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity, etag }) =>
      updateCartItemQuantity(itemId, quantity, etag),
    onMutate: async ({ itemId, quantity }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<{
        data: CartResponse;
        etag: string | null;
      }>(cartKeys.cart());

      // Optimistically update to the new value
      if (previousCart) {
        const updatedItems = previousCart.data.items?.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity,
                totalPrice: (item.pricePerUnit || 0) * quantity,
              }
            : item,
        );

        queryClient.setQueryData(cartKeys.cart(), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
          },
        });
      }

      return { previousCart };
    },
    onError: (err, _variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    ...options,
  });
}

/**
 * React Query hook to remove cart item with optimistic updates
 */
export function useRemoveCartItem(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeCartItem,
    onMutate: async (itemId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<{
        data: CartResponse;
        etag: string | null;
      }>(cartKeys.cart());

      // Optimistically update to the new value
      if (previousCart) {
        const updatedItems = previousCart.data.items?.filter(
          (item) => item.id !== itemId,
        );

        queryClient.setQueryData(cartKeys.cart(), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
          },
        });
      }

      return { previousCart };
    },
    onError: (err, _itemId, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    ...options,
  });
}

/**
 * React Query hook to remove multiple cart items with optimistic updates
 */
export function useRemoveCartItems(
  options?: UseMutationOptions<
    void,
    Error,
    { itemIds?: string[]; removeAll?: boolean }
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemIds, removeAll }) => removeCartItems(itemIds, removeAll),
    onMutate: async ({ itemIds, removeAll }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.cart() });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<{
        data: CartResponse;
        etag: string | null;
      }>(cartKeys.cart());

      // Optimistically update to the new value
      if (previousCart) {
        let updatedItems;
        if (removeAll) {
          updatedItems = [];
        } else if (itemIds) {
          updatedItems = previousCart.data.items?.filter(
            (item) => !itemIds.includes(item.id || ""),
          );
        } else {
          updatedItems = [];
        }

        queryClient.setQueryData(cartKeys.cart(), {
          ...previousCart,
          data: {
            ...previousCart.data,
            items: updatedItems,
          },
        });
      }

      return { previousCart };
    },
    onError: (err, _variables, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.cart(), context.previousCart);
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: cartKeys.cart() });
    },
    ...options,
  });
}
