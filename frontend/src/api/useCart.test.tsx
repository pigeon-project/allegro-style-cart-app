import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useAddToCart,
  useUpdateQuantity,
  useRemoveItem,
  useGetQuote,
  cartKeys,
} from "./useCart";
import type {
  QuoteResponse,
  AddItemRequest,
  UpdateItemRequest,
  QuoteRequest,
} from "../api-types";
import * as cartApi from "./cart";

// Mock the cart API
vi.mock("./cart", () => ({
  addToCart: vi.fn(),
  updateQuantity: vi.fn(),
  removeItem: vi.fn(),
  getQuote: vi.fn(),
}));

describe("useCart hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("cartKeys", () => {
    it("generates correct query keys", () => {
      expect(cartKeys.all).toEqual(["cart"]);
      expect(cartKeys.carts()).toEqual(["cart"]);
      expect(cartKeys.cart("cart-123")).toEqual(["cart", "cart-123"]);
      expect(cartKeys.quote("cart-123")).toEqual(["cart", "cart-123", "quote"]);
    });
  });

  describe("useAddToCart", () => {
    it("adds an item to the cart", async () => {
      const mockResponse: QuoteResponse = {
        cartId: "cart-123",
        items: [
          {
            itemId: "item-001",
            productId: "prod-001",
            quantity: 2,
            price: { amount: 9999, currency: "PLN" },
          },
        ],
        computed: {
          subtotal: { amount: 19998, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 19998, currency: "PLN" },
        },
      };

      vi.mocked(cartApi.addToCart).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAddToCart("cart-123"), {
        wrapper,
      });

      const request: AddItemRequest = {
        productId: "prod-001",
        quantity: 2,
      };

      result.current.mutate(request);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(cartApi.addToCart).toHaveBeenCalledWith("cart-123", request);
    });

    it("calls the API with correct parameters", async () => {
      const mockResponse: QuoteResponse = {
        cartId: "cart-123",
        items: [],
        computed: {
          subtotal: { amount: 0, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 0, currency: "PLN" },
        },
      };

      vi.mocked(cartApi.addToCart).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAddToCart("cart-123"), {
        wrapper,
      });

      const request: AddItemRequest = {
        productId: "prod-001",
        quantity: 1,
      };

      result.current.mutate(request);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(cartApi.addToCart).toHaveBeenCalledWith("cart-123", request);
    });
  });

  describe("useUpdateQuantity", () => {
    it("updates item quantity", async () => {
      const mockResponse: QuoteResponse = {
        cartId: "cart-123",
        items: [
          {
            itemId: "item-001",
            productId: "prod-001",
            quantity: 5,
            price: { amount: 9999, currency: "PLN" },
          },
        ],
        computed: {
          subtotal: { amount: 49995, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 49995, currency: "PLN" },
        },
      };

      vi.mocked(cartApi.updateQuantity).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateQuantity("cart-123"), {
        wrapper,
      });

      const request: UpdateItemRequest = {
        quantity: 5,
      };

      result.current.mutate({ itemId: "item-001", request });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(cartApi.updateQuantity).toHaveBeenCalledWith(
        "cart-123",
        "item-001",
        request,
      );
    });

    it("calls the API with correct parameters", async () => {
      const mockResponse: QuoteResponse = {
        cartId: "cart-123",
        items: [],
        computed: {
          subtotal: { amount: 0, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 0, currency: "PLN" },
        },
      };

      vi.mocked(cartApi.updateQuantity).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUpdateQuantity("cart-123"), {
        wrapper,
      });

      const request: UpdateItemRequest = {
        quantity: 3,
      };

      result.current.mutate({ itemId: "item-002", request });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(cartApi.updateQuantity).toHaveBeenCalledWith(
        "cart-123",
        "item-002",
        request,
      );
    });
  });

  describe("useRemoveItem", () => {
    it("removes an item from the cart", async () => {
      const mockResponse: QuoteResponse = {
        cartId: "cart-123",
        items: [],
        computed: {
          subtotal: { amount: 0, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 0, currency: "PLN" },
        },
      };

      vi.mocked(cartApi.removeItem).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRemoveItem("cart-123"), {
        wrapper,
      });

      result.current.mutate("item-001");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(cartApi.removeItem).toHaveBeenCalledWith("cart-123", "item-001");
    });

    it("calls the API with correct parameters", async () => {
      const mockResponse: QuoteResponse = {
        cartId: "cart-123",
        items: [],
        computed: {
          subtotal: { amount: 0, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 0, currency: "PLN" },
        },
      };

      vi.mocked(cartApi.removeItem).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRemoveItem("cart-123"), {
        wrapper,
      });

      result.current.mutate("item-002");

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(cartApi.removeItem).toHaveBeenCalledWith("cart-123", "item-002");
    });
  });

  describe("useGetQuote", () => {
    it("gets a quote for the cart", async () => {
      const mockResponse: QuoteResponse = {
        cartId: "cart-123",
        items: [
          {
            itemId: "item-001",
            productId: "prod-001",
            quantity: 2,
            price: { amount: 9999, currency: "PLN" },
            listPrice: { amount: 12999, currency: "PLN" },
          },
        ],
        computed: {
          subtotal: { amount: 19998, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 19998, currency: "PLN" },
        },
      };

      vi.mocked(cartApi.getQuote).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGetQuote(), { wrapper });

      const request: QuoteRequest = {
        cartId: "cart-123",
        items: [{ productId: "prod-001", quantity: 2 }],
      };

      result.current.mutate(request);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
    });

    it("calls the API with correct parameters", async () => {
      const mockResponse: QuoteResponse = {
        cartId: "cart-123",
        items: [],
        computed: {
          subtotal: { amount: 0, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 0, currency: "PLN" },
        },
      };

      vi.mocked(cartApi.getQuote).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGetQuote(), { wrapper });

      const request: QuoteRequest = {
        cartId: "cart-123",
        items: [{ productId: "prod-001", quantity: 2 }],
      };

      result.current.mutate(request);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(cartApi.getQuote).toHaveBeenCalledWith(request);
    });
  });
});
