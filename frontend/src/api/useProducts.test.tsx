import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useProduct,
  useProducts,
  useRecommendedProducts,
  productKeys,
} from "./useProducts";
import type { Product } from "../api-types";
import * as productsApi from "./products";

// Mock the products API
vi.mock("./products", () => ({
  getProduct: vi.fn(),
  getProducts: vi.fn(),
  getRecommendedProducts: vi.fn(),
}));

describe("useProducts hooks", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries in tests
          gcTime: 0, // Don't cache in tests
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe("productKeys", () => {
    it("generates correct query keys", () => {
      expect(productKeys.all).toEqual(["products"]);
      expect(productKeys.lists()).toEqual(["products", "list"]);
      expect(productKeys.list(["id1", "id2"])).toEqual([
        "products",
        "list",
        ["id1", "id2"],
      ]);
      expect(productKeys.details()).toEqual(["products", "detail"]);
      expect(productKeys.detail("prod-001")).toEqual([
        "products",
        "detail",
        "prod-001",
      ]);
      expect(productKeys.recommended()).toEqual(["products", "recommended"]);
    });
  });

  describe("useProduct", () => {
    it("fetches a single product", async () => {
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

      vi.mocked(productsApi.getProduct).mockResolvedValue(mockProduct);

      const { result } = renderHook(() => useProduct("prod-001"), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProduct);
      expect(productsApi.getProduct).toHaveBeenCalledWith("prod-001");
    });

    it("is in loading state initially", () => {
      vi.mocked(productsApi.getProduct).mockImplementation(
        () => new Promise(() => {}),
      );

      const { result } = renderHook(() => useProduct("prod-001"), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe("useProducts", () => {
    it("fetches multiple products", async () => {
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

      vi.mocked(productsApi.getProducts).mockResolvedValue(mockProducts);

      const { result } = renderHook(
        () => useProducts(["prod-001", "prod-002"]),
        { wrapper },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProducts);
      expect(productsApi.getProducts).toHaveBeenCalledWith([
        "prod-001",
        "prod-002",
      ]);
    });

    it("does not fetch when IDs array is empty", () => {
      const { result } = renderHook(() => useProducts([]), { wrapper });

      expect(result.current.fetchStatus).toBe("idle");
      expect(productsApi.getProducts).not.toHaveBeenCalled();
    });
  });

  describe("useRecommendedProducts", () => {
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

      vi.mocked(productsApi.getRecommendedProducts).mockResolvedValue(
        mockProducts,
      );

      const { result } = renderHook(() => useRecommendedProducts(), {
        wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockProducts);
      expect(productsApi.getRecommendedProducts).toHaveBeenCalled();
    });
  });
});
