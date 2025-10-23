import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { useRef, useCallback } from "react";
import type {
  QuoteResponse,
  QuoteRequest,
  AddItemRequest,
  UpdateItemRequest,
  CartItem,
} from "../api-types";
import { addToCart, updateQuantity, removeItem, getQuote } from "./cart";

/**
 * Query key factory for cart operations
 */
export const cartKeys = {
  all: ["cart"] as const,
  carts: () => [...cartKeys.all] as const,
  cart: (cartId: string) => [...cartKeys.carts(), cartId] as const,
  quote: (cartId: string) => [...cartKeys.cart(cartId), "quote"] as const,
};

/**
 * Debounce utility for delayed function execution
 */
function useDebounce<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number,
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );
}

/**
 * Hook to add an item to the cart with optimistic updates
 */
export function useAddToCart(
  cartId: string,
  options?: Omit<
    UseMutationOptions<
      QuoteResponse,
      Error,
      AddItemRequest,
      { previousCart?: QuoteResponse }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddItemRequest) => addToCart(cartId, request),
    onMutate: async (request: AddItemRequest) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: cartKeys.cart(cartId) });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData<QuoteResponse>(
        cartKeys.cart(cartId),
      );

      // Optimistically update the cart
      queryClient.setQueryData<QuoteResponse>(cartKeys.cart(cartId), (old) => {
        if (!old) {
          // Create new cart with the item
          return {
            cartId,
            items: [
              {
                itemId: crypto.randomUUID(),
                productId: request.productId,
                quantity: request.quantity || 1,
                price: { amount: 0, currency: "PLN" },
              },
            ],
            computed: {
              subtotal: { amount: 0, currency: "PLN" },
              delivery: { amount: 0, currency: "PLN" },
              total: { amount: 0, currency: "PLN" },
            },
          };
        }

        // Add new item to existing cart
        const newItem: CartItem = {
          itemId: crypto.randomUUID(),
          productId: request.productId,
          quantity: request.quantity || 1,
          price: { amount: 0, currency: "PLN" },
        };

        return {
          ...old,
          items: [...old.items!, newItem],
        };
      });

      return { previousCart };
    },
    onError: (_err, _request, context) => {
      // Rollback on error
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.cart(cartId), context.previousCart);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: cartKeys.cart(cartId) });
    },
    ...options,
  });
}

/**
 * Hook to update item quantity with optimistic updates
 */
export function useUpdateQuantity(
  cartId: string,
  options?: Omit<
    UseMutationOptions<
      QuoteResponse,
      Error,
      { itemId: string; request: UpdateItemRequest },
      { previousCart: QuoteResponse | undefined }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      request,
    }: {
      itemId: string;
      request: UpdateItemRequest;
    }) => updateQuantity(cartId, itemId, request),
    onMutate: async ({ itemId, request }) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart(cartId) });

      const previousCart = queryClient.getQueryData<QuoteResponse>(
        cartKeys.cart(cartId),
      );

      queryClient.setQueryData<QuoteResponse>(cartKeys.cart(cartId), (old) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items!.map((item) =>
            item.itemId === itemId
              ? { ...item, quantity: request.quantity || 1 }
              : item,
          ),
        };
      });

      return { previousCart: previousCart || undefined };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.cart(cartId), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart(cartId) });
    },
    ...options,
  });
}

/**
 * Hook to remove an item from the cart with optimistic updates
 */
export function useRemoveItem(
  cartId: string,
  options?: Omit<
    UseMutationOptions<
      QuoteResponse,
      Error,
      string,
      { previousCart?: QuoteResponse }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => removeItem(cartId, itemId),
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: cartKeys.cart(cartId) });

      const previousCart = queryClient.getQueryData<QuoteResponse>(
        cartKeys.cart(cartId),
      );

      queryClient.setQueryData<QuoteResponse>(cartKeys.cart(cartId), (old) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items!.filter((item) => item.itemId !== itemId),
        };
      });

      return { previousCart };
    },
    onError: (_err, _itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartKeys.cart(cartId), context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartKeys.cart(cartId) });
    },
    ...options,
  });
}

/**
 * Hook to get a quote with debounced API calls (300ms delay)
 * This prevents excessive API calls during rapid cart changes
 */
export function useGetQuote(
  options?: Omit<
    UseMutationOptions<QuoteResponse, Error, QuoteRequest>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: QuoteRequest) => getQuote(request),
    onSuccess: (data) => {
      // Update cart cache with quote response
      queryClient.setQueryData(cartKeys.cart(data.cartId!), data);
    },
    ...options,
  });

  // Debounce the mutate function (300ms - middle of 200-400ms range)
  const debouncedMutate = useDebounce(
    (request: QuoteRequest) => mutation.mutate(request),
    300,
  );

  return {
    ...mutation,
    mutate: debouncedMutate,
  };
}
