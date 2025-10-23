package com.github.pigeon.cart.api;

/**
 * Repository interface for stateless cart operations.
 * This repository does NOT persist cart state - it performs stateless
 * pricing and validation operations against the Product catalog.
 */
public interface CartRepository {
    
    /**
     * Calculates a quote for the given cart items.
     * This operation is stateless and does NOT persist the cart.
     * 
     * Performs:
     * - Price validation against Product catalog
     * - Availability checks
     * - Price drift detection
     * - Calculation of totals (subtotal, delivery, grand total)
     * 
     * @param request the quote request with cart ID and items
     * @return quote response with validated prices and availability
     */
    QuoteResponse calculateQuote(QuoteRequest request);
}
