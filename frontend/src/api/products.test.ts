import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProduct, getProducts, getRecommendedProducts } from "./products";
import type { Product } from "../api-types";

// Mock wretch
vi.mock("wretch", () => {
  const mockWretch = {
    url: vi.fn().mockReturnThis(),
    get: vi.fn().mockReturnThis(),
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

describe("Products API", () => {
  const mockWretchInstance = wretch("/api");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProduct", () => {
    it("fetches a single product by ID", async () => {
      const mockProduct: Product = {
        id: "prod-001",
        sellerId: "seller-1",
        sellerName: "Test Seller",
        title: "Test Product",
        imageUrl: "https://example.com/image.jpg",
        price: { amount: 9999, currency: "PLN" },
        currency: "PLN",
        availability: { inStock: true, maxOrderable: 10 },
      };

      mockWretchInstance.json = vi.fn().mockResolvedValue(mockProduct);

      const result = await getProduct("prod-001");

      expect(result).toEqual(mockProduct);
      expect(mockWretchInstance.url).toHaveBeenCalledWith("/products/prod-001");
      expect(mockWretchInstance.get).toHaveBeenCalled();
      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });

    it("includes correlation ID in request headers", async () => {
      const mockProduct: Product = {
        id: "prod-001",
        sellerId: "seller-1",
        sellerName: "Test Seller",
        title: "Test Product",
        imageUrl: "https://example.com/image.jpg",
        price: { amount: 9999, currency: "PLN" },
        currency: "PLN",
        availability: { inStock: true, maxOrderable: 10 },
      };

      mockWretchInstance.json = vi.fn().mockResolvedValue(mockProduct);

      await getProduct("prod-001");

      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });
  });

  describe("getProducts", () => {
    it("fetches multiple products by IDs", async () => {
      const mockProducts: Product[] = [
        {
          id: "prod-001",
          sellerId: "seller-1",
          sellerName: "Test Seller",
          title: "Product 1",
          imageUrl: "https://example.com/image1.jpg",
          price: { amount: 9999, currency: "PLN" },
          currency: "PLN",
          availability: { inStock: true, maxOrderable: 10 },
        },
        {
          id: "prod-002",
          sellerId: "seller-1",
          sellerName: "Test Seller",
          title: "Product 2",
          imageUrl: "https://example.com/image2.jpg",
          price: { amount: 14999, currency: "PLN" },
          currency: "PLN",
          availability: { inStock: true, maxOrderable: 5 },
        },
      ];

      mockWretchInstance.json = vi.fn().mockResolvedValue(mockProducts);

      const result = await getProducts(["prod-001", "prod-002"]);

      expect(result).toEqual(mockProducts);
      expect(mockWretchInstance.url).toHaveBeenCalledWith(
        expect.stringContaining("/products?"),
      );
      expect(mockWretchInstance.url).toHaveBeenCalledWith(
        expect.stringContaining("ids=prod-001"),
      );
      expect(mockWretchInstance.url).toHaveBeenCalledWith(
        expect.stringContaining("ids=prod-002"),
      );
    });

    it("returns empty array when no IDs provided", async () => {
      const result = await getProducts([]);

      expect(result).toEqual([]);
      expect(mockWretchInstance.url).not.toHaveBeenCalled();
    });

    it("includes correlation ID in request headers", async () => {
      mockWretchInstance.json = vi.fn().mockResolvedValue([]);

      await getProducts(["prod-001"]);

      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });
  });

  describe("getRecommendedProducts", () => {
    it("fetches recommended products", async () => {
      const mockProducts: Product[] = [
        {
          id: "prod-001",
          sellerId: "seller-1",
          sellerName: "Test Seller",
          title: "Recommended Product",
          imageUrl: "https://example.com/image.jpg",
          price: { amount: 9999, currency: "PLN" },
          currency: "PLN",
          availability: { inStock: true, maxOrderable: 10 },
        },
      ];

      mockWretchInstance.json = vi.fn().mockResolvedValue(mockProducts);

      const result = await getRecommendedProducts();

      expect(result).toEqual(mockProducts);
      expect(mockWretchInstance.url).toHaveBeenCalledWith(
        "/products/recommended",
      );
      expect(mockWretchInstance.get).toHaveBeenCalled();
    });

    it("includes correlation ID in request headers", async () => {
      mockWretchInstance.json = vi.fn().mockResolvedValue([]);

      await getRecommendedProducts();

      expect(mockWretchInstance.headers).toHaveBeenCalledWith(
        expect.objectContaining({
          "X-Correlation-ID": expect.any(String),
        }),
      );
    });
  });
});
