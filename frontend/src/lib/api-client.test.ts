import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { withRetry } from "./api-client";

// Mock WretchError for testing
class MockWretchError extends Error {
  status?: number;
  response: Response;
  request: Request;

  constructor(status: number) {
    super("Wretch error");
    this.name = "WretchError";
    this.status = status;
    this.response = new Response(null, {
      status,
      headers: new Headers(),
    });
    this.request = new Request("http://test.com");
  }
}

describe("API Client Retry Logic", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("withRetry", () => {
    it("returns result immediately on success", async () => {
      const mockFn = vi.fn().mockResolvedValue("success");

      const promise = withRetry(mockFn, "GET");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("retries on 5xx errors for GET requests", async () => {
      const error = new MockWretchError(503);

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const promise = withRetry(mockFn, "GET");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it("does not retry on 5xx errors for POST requests", async () => {
      const error = new MockWretchError(503);
      const mockFn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(mockFn, "POST");

      await expect(promise).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("respects max retries limit", async () => {
      const error = new MockWretchError(503);
      const mockFn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(mockFn, "GET", { maxRetries: 2 });
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it("applies exponential backoff", async () => {
      const error = new MockWretchError(503);

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const promise = withRetry(mockFn, "GET", {
        baseDelay: 100,
        maxDelay: 5000,
      });

      // First retry should happen after some delay
      await vi.advanceTimersByTimeAsync(50);
      expect(mockFn).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(250);
      expect(mockFn).toHaveBeenCalledTimes(2);

      // Second retry with exponential backoff
      await vi.advanceTimersByTimeAsync(600);
      expect(mockFn).toHaveBeenCalledTimes(3);

      const result = await promise;
      expect(result).toBe("success");
    });

    it("does not retry on 4xx client errors", async () => {
      const error = new MockWretchError(400);
      const mockFn = vi.fn().mockRejectedValue(error);

      await expect(withRetry(mockFn, "GET")).rejects.toThrow();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it("retries different 5xx status codes", async () => {
      const error500 = new MockWretchError(500);
      const error502 = new MockWretchError(502);
      const error504 = new MockWretchError(504);

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error500)
        .mockRejectedValueOnce(error502)
        .mockRejectedValueOnce(error504)
        .mockResolvedValue("success");

      const promise = withRetry(mockFn, "GET");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(4);
    });

    it("retries on network errors for idempotent operations", async () => {
      const networkError = new TypeError("Failed to fetch");

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(networkError)
        .mockResolvedValue("success");

      const promise = withRetry(mockFn, "GET");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("retries PUT requests (idempotent)", async () => {
      const error = new MockWretchError(503);

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const promise = withRetry(mockFn, "PUT");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it("retries DELETE requests (idempotent)", async () => {
      const error = new MockWretchError(503);

      const mockFn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue("success");

      const promise = withRetry(mockFn, "DELETE");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe("success");
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});
