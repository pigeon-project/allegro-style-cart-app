package com.github.pigeon.cart.api;

/**
 * Represents the response to a quote request.
 * Extends CartSnapshot with server-validated prices and availability.
 */
public record QuoteResponse(
        String cartId,
        java.util.List<CartItem> items,
        CartComputed computed
) {
    
    public QuoteResponse {
        if (cartId == null || cartId.isBlank()) {
            throw new IllegalArgumentException("Cart id cannot be null or blank");
        }
        if (items == null) {
            throw new IllegalArgumentException("Items cannot be null");
        }
        if (computed == null) {
            throw new IllegalArgumentException("Computed totals cannot be null");
        }
    }
    
    /**
     * Creates a QuoteResponse from a CartSnapshot.
     * 
     * @param snapshot The cart snapshot
     * @return A quote response with the same data
     */
    public static QuoteResponse fromCartSnapshot(CartSnapshot snapshot) {
        return new QuoteResponse(snapshot.cartId(), snapshot.items(), snapshot.computed());
    }
}
