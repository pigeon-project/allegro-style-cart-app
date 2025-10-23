package com.github.pigeon.cart.api;

import java.util.List;

/**
 * Represents a request to quote prices and totals for cart items.
 * 
 * @param cartId Unique identifier for the cart
 * @param items  List of items with productId and quantity
 */
public record QuoteRequest(
        String cartId,
        List<QuoteItem> items
) {
    
    public QuoteRequest {
        if (cartId == null || cartId.isBlank()) {
            throw new IllegalArgumentException("Cart id cannot be null or blank");
        }
        if (items == null) {
            throw new IllegalArgumentException("Items cannot be null");
        }
    }
    
    /**
     * Represents a single item in a quote request.
     * 
     * @param productId Identifier of the product
     * @param quantity  Quantity requested
     */
    public record QuoteItem(
            String productId,
            int quantity
    ) {
        
        public QuoteItem {
            if (productId == null || productId.isBlank()) {
                throw new IllegalArgumentException("Product id cannot be null or blank");
            }
            if (quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be positive");
            }
        }
    }
}
