import wretch from "wretch";

/**
 * Base HTTP client configured with:
 * - Base URL for API endpoints
 * - Default headers including correlation ID
 * - Error handling
 */
export function createHttpClient() {
  return wretch("/api").options({
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Adds correlation ID header to request
 */
export function withCorrelationId(client: ReturnType<typeof createHttpClient>) {
  const correlationId = crypto.randomUUID();
  return client.headers({ "X-Correlation-ID": correlationId });
}
