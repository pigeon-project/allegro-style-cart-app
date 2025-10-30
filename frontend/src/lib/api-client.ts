import wretch, { type WretchError } from "wretch";

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatusCodes: number[];
}

/**
 * Default retry configuration following SHARED-NFR Section 11
 * - Exponential backoff with jitter for 5xx errors
 * - Retry idempotent operations
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 100, // ms
  maxDelay: 5000, // ms
  retryableStatusCodes: [500, 502, 503, 504],
};

/**
 * Calculate delay with exponential backoff and jitter
 * Formula: min(maxDelay, baseDelay * 2^attempt * random(0.5, 1.5))
 */
function calculateBackoffDelay(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelay * Math.pow(2, attempt);
  const jitter = 0.5 + Math.random(); // Random between 0.5 and 1.5
  const delayWithJitter = exponentialDelay * jitter;
  return Math.min(config.maxDelay, delayWithJitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Extract Retry-After header value in seconds
 * Handles both HTTP-date and delay-seconds formats
 */
function getRetryAfterDelay(retryAfter: string | null): number | null {
  if (!retryAfter) return null;

  // Try parsing as seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to milliseconds
  }

  // Try parsing as HTTP-date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    const delay = date.getTime() - Date.now();
    return Math.max(0, delay);
  }

  return null;
}

/**
 * Enhanced wretch instance with retry logic and error handling
 * Follows SHARED-NFR Section 11 guidelines:
 * - Exponential backoff with jitter for 5xx errors
 * - Honors Retry-After header for 429 responses
 * - Only retries idempotent operations (GET, PUT, DELETE)
 */
export function createApiClient(baseUrl = "") {
  return wretch(baseUrl)
    .errorType("json")
    .resolve((resolver) =>
      resolver
        .unauthorized((error) => {
          // Redirect to login or handle unauthorized
          console.error("Unauthorized:", error);
          throw error;
        })
        .forbidden((error) => {
          console.error("Forbidden:", error);
          throw error;
        })
        .notFound((error) => {
          console.error("Not found:", error);
          throw error;
        })
        .timeout((error) => {
          console.error("Request timeout:", error);
          throw error;
        })
        .fetchError((error) => {
          console.error("Network error:", error);
          throw error;
        }),
    );
}

/**
 * Execute a request with retry logic
 * Only retries idempotent operations (GET, PUT, DELETE)
 */
export async function withRetry<T>(
  requestFn: () => Promise<T>,
  method: string,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const isIdempotent = ["GET", "PUT", "DELETE"].includes(method.toUpperCase());

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry non-idempotent operations
      if (!isIdempotent) {
        throw error;
      }

      // Handle 429 Rate Limit with Retry-After
      const wretchError = error as WretchError;
      if (wretchError.status === 429) {
        const retryAfter = wretchError.response?.headers.get("Retry-After");
        const delay = getRetryAfterDelay(retryAfter);

        if (delay !== null && attempt < retryConfig.maxRetries) {
          console.warn(
            `Rate limited (429). Retrying after ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries})`,
          );
          await sleep(delay);
          continue;
        }

        // If no valid Retry-After or max retries reached, throw
        throw error;
      }

      // Check if error is retryable (5xx errors)
      const isRetryable =
        wretchError.status !== undefined &&
        retryConfig.retryableStatusCodes.includes(wretchError.status);

      // Check if this is a network error (no status code)
      const isNetworkError =
        error instanceof Error &&
        wretchError.status === undefined &&
        (error.name === "TypeError" || error.message.includes("fetch"));

      if (!isRetryable && !isNetworkError) {
        throw error;
      }

      // If we've exhausted retries, throw
      if (attempt >= retryConfig.maxRetries) {
        throw error;
      }

      // Calculate backoff delay and retry
      const delay = calculateBackoffDelay(attempt, retryConfig);
      console.warn(
        `Request failed (attempt ${attempt + 1}/${retryConfig.maxRetries}). Retrying after ${delay}ms`,
      );
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error("Max retries exceeded");
}
