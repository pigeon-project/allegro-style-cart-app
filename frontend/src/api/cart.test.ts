import { describe, it, expect, vi, beforeEach } from "vitest";
import { addToCart, updateQuantity, removeItem, getQuote } from "./cart";
import type {
  QuoteResponse,
  AddItemRequest,
  UpdateItemRequest,
  QuoteRequest,
} from "../api-types";

// Mock wretch
vi.mock("wretch", () => {
  const mockWretch = {
    url: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
    post: vi.fn().mockReturnThis(),
    patch: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    json: vi.fn(),
    options: vi.fn().mockReturnThis(),
    headers: vi.fn().mockReturnThis(),
  };

  return {
    default: vi.fn(() => mockWretch),
  };
});

// Import wretch after mocking
import wretch from "wretch";

describe("Cart API", () => {
  const mockWretchInstance = wretch("/api");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addToCart", () => {
    it("adds an item to the cart", async () => {
      const request: AddItemRequest = {
        productId: "prod-001",
        quantity: 2,
      };

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

      mockWretchInstance.json = vi.fn().mockResolvedValue(mockResponse);

      const result = await addToCart("cart-123", request);

      expect(result).toEqual(mockResponse);
      expect(mockWretchInstance.url).toHaveBeenCalledWith(
        "/carts/cart-123/items",
      );
      expect(mockWretchInstance.post).toHaveBeenCalledWith(request);
      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });

    it("includes correlation ID in request headers", async () => {
      const request: AddItemRequest = {
        productId: "prod-001",
        quantity: 1,
      };

      mockWretchInstance.json = vi.fn().mockResolvedValue({
        cartId: "cart-123",
        items: [],
        computed: {
          subtotal: { amount: 0, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 0, currency: "PLN" },
        },
      });

      await addToCart("cart-123", request);

      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });
  });

  describe("updateQuantity", () => {
    it("updates item quantity in the cart", async () => {
      const request: UpdateItemRequest = {
        quantity: 5,
      };

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

      mockWretchInstance.json = vi.fn().mockResolvedValue(mockResponse);

      const result = await updateQuantity("cart-123", "item-001", request);

      expect(result).toEqual(mockResponse);
      expect(mockWretchInstance.url).toHaveBeenCalledWith(
        "/carts/cart-123/items/item-001",
      );
      expect(mockWretchInstance.patch).toHaveBeenCalledWith(request);
      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });
  });

  describe("removeItem", () => {
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

      mockWretchInstance.json = vi.fn().mockResolvedValue(mockResponse);

      const result = await removeItem("cart-123", "item-001");

      expect(result).toEqual(mockResponse);
      expect(mockWretchInstance.url).toHaveBeenCalledWith(
        "/carts/cart-123/items/item-001",
      );
      expect(mockWretchInstance.delete).toHaveBeenCalled();
      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });
  });

  describe("getQuote", () => {
    it("gets a quote for the cart", async () => {
      const request: QuoteRequest = {
        cartId: "cart-123",
        items: [
          { productId: "prod-001", quantity: 2 },
          { productId: "prod-002", quantity: 1 },
        ],
      };

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
          {
            itemId: "item-002",
            productId: "prod-002",
            quantity: 1,
            price: { amount: 14999, currency: "PLN" },
          },
        ],
        computed: {
          subtotal: { amount: 34997, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 34997, currency: "PLN" },
        },
      };

      mockWretchInstance.json = vi.fn().mockResolvedValue(mockResponse);

      const result = await getQuote(request);

      expect(result).toEqual(mockResponse);
      expect(mockWretchInstance.url).toHaveBeenCalledWith(
        "/carts/cart-123/quote",
      );
      expect(mockWretchInstance.post).toHaveBeenCalledWith(request);
      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });

    it("includes correlation ID in request headers", async () => {
      const request: QuoteRequest = {
        cartId: "cart-123",
        items: [],
      };

      mockWretchInstance.json = vi.fn().mockResolvedValue({
        cartId: "cart-123",
        items: [],
        computed: {
          subtotal: { amount: 0, currency: "PLN" },
          delivery: { amount: 0, currency: "PLN" },
          total: { amount: 0, currency: "PLN" },
        },
      });

      await getQuote(request);

      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });
  });
});
